const Batch = require('../models/Batch');
const { getBatch } = require('../utils/blockchain');

// @desc    Get public traceability journey for a batch
// @route   GET /api/traceability/:batchId
// @access  Public
const getBatchJourney = async (req, res) => {
  const { batchId } = req.params;

  try {
    // 1. Fetch from DB
    const batch = await Batch.findOne({ batchId })
      .populate('journey.handler', 'name role location');

    // 2. Fetch from Blockchain
    let blockchainData = null;
    try {
      blockchainData = await getBatch(batchId);
    } catch (err) {
      console.log("Blockchain fetch error (expected if batch doesn't exist on chain yet):", err.message);
    }

    if (!batch && !blockchainData) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json({
      dbData: batch,
      blockchainData: blockchainData
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBatchJourney };
