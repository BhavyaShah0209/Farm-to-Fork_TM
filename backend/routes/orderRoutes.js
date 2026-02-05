const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, completeOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createOrder);
router.get('/', protect, getOrders);
router.put('/:id/status', protect, updateOrderStatus);
router.post('/:id/complete', protect, completeOrder);

module.exports = router;
