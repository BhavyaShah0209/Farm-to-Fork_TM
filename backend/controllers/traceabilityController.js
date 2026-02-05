const Batch = require('../models/Batch');

// @desc    Get public traceability journey for a batch
// @route   GET /api/traceability/:batchId
// @access  Public
const getBatchJourney = async (req, res) => {
  const { batchId } = req.params;

  try {
    const batch = await Batch.findOne({ batchId })
      .populate('journey.handler', 'name role location');

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json(batch);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBatchJourney };
