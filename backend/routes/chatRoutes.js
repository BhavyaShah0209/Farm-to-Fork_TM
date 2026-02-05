const express = require('express');
const router = express.Router();
const {
  createOrGetChat,
  sendMessage,
  getUserChats,
  getChat,
  getUnreadCount,
  deleteChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get all chats for logged in user
router.get('/', getUserChats);

// Get unread message count
router.get('/unread/count', getUnreadCount);

// Create or get chat for an order
router.post('/order/:orderId', createOrGetChat);

// Get specific chat
router.get('/:chatId', getChat);

// Send message in a chat
router.post('/:chatId/message', sendMessage);

// Delete/Close chat
router.delete('/:chatId', deleteChat);

module.exports = router;
