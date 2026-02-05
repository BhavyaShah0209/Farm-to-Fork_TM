const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Batch = require('../models/Batch');

// @desc    Distributor requests to buy from a listing
// @route   POST /api/orders/create
// @access  Private (Distributor/Retailer)
const createOrder = async (req, res) => {
  const { listingId, quantity } = req.body;
  const buyer = req.user._id;

  try {
    const listing = await Listing.findById(listingId).populate('seller');

    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller._id.toString() === buyer.toString()) {
      return res.status(400).json({ message: 'You cannot buy your own listing' });
    }
    if (listing.quantityAvailable < quantity) {
      return res.status(400).json({ message: `Only ${listing.quantityAvailable}kg available` });
    }

    const totalPrice = listing.pricePerKg * quantity;

    const order = await Order.create({
      listing: listingId,
      buyer,
      seller: listing.seller._id,
      quantityRequest: quantity,
      totalPrice,
      status: 'pending',
      chatEnabled: true
    });

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('listing')
      .populate('seller', 'name role email mobile')
      .populate('buyer', 'name role email mobile');

    res.status(201).json({
      message: 'Order created, waiting for approval. You can now chat with the seller.',
      order: populatedOrder,
      chatAvailable: true
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Inbound (Sales) and Outbound (Purchases) orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Orders where I am the buyer
    const purchases = await Order.find({ buyer: userId })
      .populate({
        path: 'listing',
        populate: { path: 'batch' }
      })
      .populate('seller', 'name role')
      .sort({ createdAt: -1 });

    // Orders where I am the seller
    console.log(`Fetching sales for seller: ${userId}`);
    const sales = await Order.find({ seller: userId })
      .populate({
        path: 'listing',
        populate: { path: 'batch' }
      })
      .populate('buyer', 'name role')
      .sort({ createdAt: -1 });

    console.log(`Found ${sales.length} sales orders.`);

    res.json({ purchases, sales });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or Reject Order (Seller)
// @route   PUT /api/orders/:id/status
// @access  Private (Seller only)
const updateOrderStatus = async (req, res) => {
  const { status } = req.body; // 'approved', 'rejected'
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage this order' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: `Order is already ${order.status}` });
    }

    order.status = status;
    await order.save();

    res.json({ message: `Order ${status}`, order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Simulate Payment & Transfer Ownership
// @route   POST /api/orders/:id/complete
// @access  Private
const completeOrder = async (req, res) => {
  const orderId = req.params.id;
  const { paymentId } = req.body; // Receive paymentId from frontend

  try {
    const order = await Order.findById(orderId).populate('listing').populate('buyer');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check if approved
    if (order.status !== 'approved') {
      return res.status(400).json({ message: 'Order must be approved by seller first' });
    }

    const parentListing = await Listing.findById(order.listing._id);
    if (parentListing.quantityAvailable < order.quantityRequest) {
      // Fail safely if stock is gone
      return res.status(400).json({ message: 'Insufficient stock available to complete this order.' });
    }

    // 1. Update Order Status & Payment Info
    order.status = 'transferred';
    if (paymentId) {
      order.paymentId = paymentId;
      order.status = 'transferred'; // Or 'paid' then 'traceability' logic
    }
    await order.save();

    // 2. Reduce Parent Listing Quantity
    parentListing.quantityAvailable -= order.quantityRequest;
    if (parentListing.quantityAvailable <= 0) {
      parentListing.isActive = false;
      parentListing.quantityAvailable = 0; // Ensure no negative
    }
    await parentListing.save();

    // 3. Update Batch Journey (Traceability)
    const batch = await Batch.findById(parentListing.batch);
    batch.journey.push({
      handler: order.buyer._id,
      role: order.buyer.role, // Dynamic role (Distributor/Retailer)
      action: 'Bought',
      date: new Date()
    });
    await batch.save();

    // 4. Create CHILD Listing (The "Repost")
    // Distributor now owns this portion and can resell it
    const childListing = await Listing.create({
      batch: batch._id,
      seller: order.buyer,
      parentListing: parentListing._id,
      quantityAvailable: order.quantityRequest,
      pricePerKg: parentListing.pricePerKg, // Default to bought price, they can update later
      isActive: false // Inactive until they choose to sell
    });

    res.json({
      message: 'Order Completed & Ownership Transferred',
      childListingId: childListing._id,
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus, completeOrder };
