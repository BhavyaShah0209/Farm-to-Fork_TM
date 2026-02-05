const Batch = require('../models/Batch');
const Listing = require('../models/Listing');
const { createBatch } = require('../utils/blockchain');
const { uploadToIPFS } = require('../utils/ipfs');
const { encrypt } = require('../utils/encryption');

// @desc    Farmer creates a new crop batch and listing
// @route   POST /api/listings/create (Farmer only)
// @access  Private
const createBatchAndListing = async (req, res) => {
  const { cropName, quantity, pricePerKg, harvestDate, originLocation } = req.body;
  const seller = req.user._id;

  if (req.user.role !== 'farmer') {
    return res.status(403).json({ message: 'Only farmers can create fresh batches' });
  }

  try {
    // 1. Generate unique Batch ID
    const batchId = `BATCH_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const farmerId = `FARMER_${seller.toString().slice(-8)}`; // Extract last 8 chars of MongoDB ID

    console.log(`\n🌾 Farmer creating batch: ${batchId}`);
    console.log(`   Farmer: ${req.user.name} (${farmerId})`);
    console.log(`   Crop: ${cropName}, Quantity: ${quantity}kg`);

    // 2. Prepare metadata for blockchain
    const batchMetadata = {
      cropName,
      quantityInitial: quantity,
      harvestDate,
      originLocation,
      farmerName: req.user.name,
      farmerWallet: req.user.walletAddress,
      createdAt: new Date().toISOString()
    };

    // 3. Upload metadata to IPFS (or encrypt it)
    let dataHash;
    try {
      const ipfsHash = await uploadToIPFS(batchMetadata);
      dataHash = ipfsHash;
      console.log(`   📦 IPFS Hash: ${ipfsHash}`);
    } catch (ipfsError) {
      // Fallback: Use encrypted hash
      console.log(`   ⚠️  IPFS upload failed, using encrypted hash`);
      const encryptedData = encrypt(JSON.stringify(batchMetadata));
      dataHash = encryptedData.substring(0, 31); // Smart contract accepts bytes32
    }

    // 4. 🔥 CREATE BATCH ON BLOCKCHAIN - THIS SHOWS IN TENDERLY!
    let blockchainTx;
    try {
      blockchainTx = await createBatch(
        batchId,
        quantity,
        farmerId,
        dataHash
      );
      
      console.log(`   ✅ Blockchain transaction: ${blockchainTx.txHash}`);
      console.log(`   🔗 View in Tenderly: https://dashboard.tenderly.co/tx/${blockchainTx.txHash}`);
      
      // Log events emitted
      if (blockchainTx.events && blockchainTx.events.length > 0) {
        console.log(`   📋 Events emitted:`);
        blockchainTx.events.forEach(event => {
          console.log(`      - ${event.name}`);
        });
      }
      
    } catch (blockchainError) {
      console.error(`   ❌ Blockchain error:`, blockchainError.message);
      // Continue anyway - blockchain is optional for now
      blockchainTx = { txHash: null, error: blockchainError.message };
    }

    // 5. Create MongoDB Batch record
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
        date: new Date(),
        transactionHash: blockchainTx.txHash || 'pending'
      }]
    });

    // 6. Create the Sales Listing
    const newListing = await Listing.create({
      batch: newBatch._id,
      seller,
      parentListing: null, // Root listing
      quantityAvailable: quantity,
      pricePerKg,
      isActive: true
    });

    console.log(`   ✅ MongoDB records created`);
    console.log(`   📊 Check Tenderly for BatchCreated event!\n`);

    res.status(201).json({
      message: 'Batch listed successfully',
      batch: newBatch,
      listing: newListing,
      blockchain: {
        txHash: blockchainTx.txHash,
        batchId,
        farmerId,
        tenderlyUrl: blockchainTx.txHash 
          ? `https://dashboard.tenderly.co/aarushee_p/tedhemedhes/testnet/TMtestnet1/tx/${blockchainTx.txHash}`
          : null
      }
    });

  } catch (error) {
    console.error('❌ Error creating batch:', error);
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