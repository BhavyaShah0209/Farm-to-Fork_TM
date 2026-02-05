const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  quantityRequest: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'transferred', 'rejected'],
    default: 'pending'
  },

  // Payment ID from Razorpay
  paymentId: String,

  // Blockchain Transaction Hash (Proof of ownership transfer)
  txHash: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
