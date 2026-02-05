const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  // Link to the Immutable Product
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },

  // Who is selling this SPECIFIC portion?
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Parent Listing (Traces back to who they bought it from)
  parentListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },

  // Mutable Data (Can change per seller)
  quantityAvailable: { type: Number, required: true }, // e.g., 2kg (bought from 10kg)
  pricePerKg: { type: Number, required: true },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
