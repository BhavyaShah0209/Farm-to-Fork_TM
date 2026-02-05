const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for faster queries
chatSchema.index({ order: 1 });
chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);
