const express = require('express');
const router = express.Router();
const { createBatchAndListing, getListings, getListingById, updateListing } = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createBatchAndListing);
router.get('/', protect, getListings);
router.get('/:id', protect, getListingById);
router.put('/:id', protect, updateListing);

module.exports = router;
