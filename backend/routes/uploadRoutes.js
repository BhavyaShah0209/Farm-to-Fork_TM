const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Temporary storage before IPFS upload
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only accept images and PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and PDF files are allowed!'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: fileFilter
});

// Routes
/**
 * @route   POST /api/upload/single
 * @desc    Upload single file to IPFS
 * @access  Private
 */
router.post('/single', protect, upload.single('file'), uploadController.uploadSingle);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files to IPFS
 * @access  Private
 */
router.post('/multiple', protect, upload.array('files', 10), uploadController.uploadMultiple);

/**
 * @route   POST /api/upload/quality-proof
 * @desc    Upload quality proof documents (receipts, certificates)
 * @access  Private
 */
router.post('/quality-proof', protect, upload.array('files', 5), uploadController.uploadQualityProof);

/**
 * @route   GET /api/upload/:hash
 * @desc    Get IPFS file URL from hash
 * @access  Public
 */
router.get('/:hash', uploadController.getFileUrl);

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size is too large. Maximum size is 10MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 10 files.'
            });
        }
    }
    
    res.status(400).json({
        success: false,
        message: error.message
    });
});

module.exports = router;
