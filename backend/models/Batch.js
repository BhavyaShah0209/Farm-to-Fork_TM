const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  // The "Post ID" that stays constant across users
  batchId: { type: String, required: true, unique: true },

  // Immutable Data (Blockchain Data)
  cropName: { type: String, required: true },
  quantityInitial: { type: Number, required: true }, // e.g. 10kg
  harvestDate: { type: Date, required: true },
  originLocation: { type: String, required: true },

  // Quality Checks
  fertilizers: [String], // e.g. ["Urea", "DAP"]
  pesticides: [String], // e.g. ["Neem Oil"]
  qualityCertificateUrl: String,
  proofImageUrl: String, // Verification proof (Generic)
  fertilizerProofUrl: String, // Specific invoice/image for fertilizers
  pesticideProofUrl: String, // Specific invoice/image for pesticides
  imageUrl: String,      // Main display image of the crop

  // The Traceability Chain (Who held this and when)
  journey: [{
    handler: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    date: { type: Date, default: Date.now },
    action: String, // e.g., "Harvested", "Bought", "Sold"
    transactionHash: String // Link to Blockchain
  }]
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
