const Batch = require('../models/Batch');
const Listing = require('../models/Listing');
const { getContract } = require('../utils/blockchain');

// @desc    Farmer creates a new crop batch and listing
// @route   POST /api/listings/create (Farmer only)
// @access  Private
const createBatchAndListing = async (req, res) => {
  const { cropName, quantity, pricePerKg, harvestDate, originLocation } = req.body;
  const seller = req.user._id;

  if (!req.user.role === 'farmer') {
    return res.status(403).json({ message: 'Only farmers can create fresh batches' });
  }

  try {
    // 1. Create the Immutable Batch (The "Post ID")
    // In a real scenario, we would interact with Blockchain here to get a TxHash
    const batchId = `BATCH_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newBatch = await Batch.create({
      batchId,
      cropName,
      quantityInitial: quantity,
      harvestDate,
      originLocation,
      journey: [{
        handler: seller,
        role: 'farmer',
        action: 'Harvested & Listed',
        date: new Date()
      }]
    });

    // 2. Create the Sales Listing
    const newListing = await Listing.create({
      batch: newBatch._id,
      seller,
      parentListing: null, // Root listing
      quantityAvailable: quantity,
      pricePerKg,
      isActive: true
    });

    res.status(201).json({
      message: 'Batch listed successfully',
      batch: newBatch,
      listing: newListing
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create listing', error: error.message });
  }
};

// @desc    Get listings (Active for everyone, All for owner)
// @route   GET /api/listings
// @access  Private
const getListings = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find listings that are EITHER:
    // 1. Active (Public Market)
    // 2. Owned by the requester (My Inventory, even if inactive)
    const listings = await Listing.find({
      $or: [
        { isActive: true },
        { seller: userId }
      ]
    })
      .populate('batch')
      .populate('seller', 'name location role mobile walletAddress');

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch listings', error: error.message });
  }
};

// @desc    Get details of a specific listing
// @route   GET /api/listings/:id
// @access  Private
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('batch')
      .populate('seller', 'name location role mobile');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update listing (e.g. Activate for sale, change price)
// @route   PUT /api/listings/:id
// @access  Private (Seller only)
const updateListing = async (req, res) => {
  const { pricePerKg, isActive } = req.body;

  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ensure the user owns this listing
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    if (pricePerKg) listing.pricePerKg = pricePerKg;
    if (isActive !== undefined) listing.isActive = isActive;

    await listing.save();

    res.json({ message: 'Listing updated', listing });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBatchAndListing, getListings, getListingById, updateListing };
