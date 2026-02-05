const Chat = require('../models/Chat');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Create or get existing chat for an order
// @route   POST /api/chats/order/:orderId
// @access  Private
exports.createOrGetChat = async (req, res) => {
  try {
    const { orderId, listingId } = req.body; // Changed to body to support flexible args

    let filter = {};
    let participants = [];

    if (orderId) {
      // Chat linked to Order
      const order = await Order.findById(orderId).populate('buyer seller');
      if (!order) return res.status(404).json({ message: 'Order not found' });

      filter = { order: orderId };
      participants = [order.buyer._id, order.seller._id];
    } else if (listingId) {
      // Chat linked to Listing (Pre-sales)
      const listing = await require('../models/Listing').findById(listingId); // Lazy load
      if (!listing) return res.status(404).json({ message: 'Listing not found' });

      // Check if user is seller or buyer
      const currentUserId = req.user._id;
      const sellerId = listing.seller;

      // Valid participants: Seller + Requester
      if (currentUserId.toString() === sellerId.toString()) {
        return res.status(400).json({ message: 'Seller cannot start chat with themselves' });
      }

      filter = { listing: listingId, participants: { $all: [currentUserId, sellerId] } };
      participants = [currentUserId, sellerId];
    } else {
      return res.status(400).json({ message: 'Provide orderId or listingId' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne(filter)
      .populate('participants', 'name email mobile role')
      .populate('messages.sender', 'name role');

    // If chat doesn't exist, create new one
    if (!chat) {
      const chatData = {
        participants,
        messages: []
      };
      if (orderId) chatData.order = orderId;
      if (listingId) chatData.listing = listingId;

      chat = await Chat.create(chatData);

      chat = await Chat.findById(chat._id)
        .populate('participants', 'name email mobile role')
        .populate('messages.sender', 'name role');
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send a message in a chat
// @route   POST /api/chats/:chatId/message
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Find chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    const userId = req.user._id.toString();
    const isParticipant = chat.participants.some(
      participant => participant.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    // Create message
    const newMessage = {
      sender: req.user._id,
      content: content.trim(),
      readBy: [req.user._id],
      timestamp: new Date()
    };

    // Add message to chat
    chat.messages.push(newMessage);

    // Update lastMessage
    chat.lastMessage = {
      content: content.trim(),
      sender: req.user._id,
      timestamp: newMessage.timestamp
    };

    await chat.save();

    // Populate the new message sender details
    const updatedChat = await Chat.findById(chatId)
      .populate('participants', 'name email mobile role')
      .populate('messages.sender', 'name role');

    res.status(201).json({
      success: true,
      data: {
        chat: updatedChat,
        message: updatedChat.messages[updatedChat.messages.length - 1]
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all chats for logged in user
// @route   GET /api/chats
// @access  Private
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      participants: userId,
      isActive: true
    })
      .populate('participants', 'name email mobile role')
      .populate('order')
      .populate('lastMessage.sender', 'name role')
      .sort({ 'lastMessage.timestamp': -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a specific chat with all messages
// @route   GET /api/chats/:chatId
// @access  Private
exports.getChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'name email mobile role')
      .populate('order')
      .populate('messages.sender', 'name role');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    const userId = req.user._id.toString();
    const isParticipant = chat.participants.some(
      participant => participant._id.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    // Mark messages as read by this user
    let updated = false;
    chat.messages.forEach(message => {
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get unread message count for user
// @route   GET /api/chats/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      participants: userId,
      isActive: true
    });

    let totalUnread = 0;
    const unreadByChat = {};

    chats.forEach(chat => {
      let unreadCount = 0;
      chat.messages.forEach(message => {
        if (!message.readBy.includes(userId)) {
          unreadCount++;
        }
      });
      if (unreadCount > 0) {
        unreadByChat[chat._id] = unreadCount;
        totalUnread += unreadCount;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUnread,
        unreadByChat
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete/Close a chat
// @route   DELETE /api/chats/:chatId
// @access  Private
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    const userId = req.user._id.toString();
    const isParticipant = chat.participants.some(
      participant => participant.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to delete this chat' });
    }

    // Soft delete - mark as inactive
    chat.isActive = false;
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Chat closed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
