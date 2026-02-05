const { uploadFileToIPFS, uploadMultipleFiles, getIPFSUrl } = require('../utils/ipfs');
const fs = require('fs').promises;
const path = require('path');

/**
 * Upload single file to IPFS
 * @route POST /api/upload/single
 */
exports.uploadSingle = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload to IPFS
        const result = await uploadFileToIPFS(req.file.path, req.file.originalname);

        // Delete local file after upload
        await fs.unlink(req.file.path);

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                ipfsHash: result.hash,
                url: result.url,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        
        // Clean up file if upload failed
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload file',
            error: error.message
        });
    }
};

/**
 * Upload multiple files to IPFS
 * @route POST /api/upload/multiple
 */
exports.uploadMultiple = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        // Prepare files for upload
        const files = req.files.map(file => ({
            path: file.path,
            name: file.originalname
        }));

        // Upload all files to IPFS
        const results = await uploadMultipleFiles(files);

        // Delete local files after upload
        await Promise.all(req.files.map(file => fs.unlink(file.path)));

        res.json({
            success: true,
            message: `${results.length} files uploaded successfully`,
            data: results.map((result, index) => ({
                ipfsHash: result.hash,
                url: result.url,
                fileName: result.fileName,
                fileSize: req.files[index].size,
                mimeType: req.files[index].mimetype
            }))
        });
    } catch (error) {
        console.error('Multiple upload error:', error);
        
        // Clean up files if upload failed
        if (req.files) {
            await Promise.all(
                req.files.map(file => 
                    fs.unlink(file.path).catch(err => console.error('Error deleting file:', err))
                )
            );
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload files',
            error: error.message
        });
    }
};

/**
 * Get IPFS file URL from hash
 * @route GET /api/upload/:hash
 */
exports.getFileUrl = async (req, res) => {
    try {
        const { hash } = req.params;

        if (!hash) {
            return res.status(400).json({
                success: false,
                message: 'IPFS hash is required'
            });
        }

        const url = getIPFSUrl(hash);

        res.json({
            success: true,
            data: {
                ipfsHash: hash,
                url: url
            }
        });
    } catch (error) {
        console.error('Get URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get file URL',
            error: error.message
        });
    }
};

/**
 * Upload quality proof (pesticides/fertilizers receipts)
 * @route POST /api/upload/quality-proof
 */
exports.uploadQualityProof = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No proof files uploaded'
            });
        }

        const { batchId, proofType } = req.body;

        if (!batchId || !proofType) {
            return res.status(400).json({
                success: false,
                message: 'Batch ID and proof type are required'
            });
        }

        // Prepare files for upload
        const files = req.files.map(file => ({
            path: file.path,
            name: `${proofType}_${batchId}_${file.originalname}`
        }));

        // Upload to IPFS
        const results = await uploadMultipleFiles(files);

        // Delete local files
        await Promise.all(req.files.map(file => fs.unlink(file.path)));

        res.json({
            success: true,
            message: 'Quality proof uploaded successfully',
            data: {
                batchId,
                proofType,
                files: results.map((result, index) => ({
                    ipfsHash: result.hash,
                    url: result.url,
                    fileName: result.fileName,
                    fileSize: req.files[index].size
                }))
            }
        });
    } catch (error) {
        console.error('Quality proof upload error:', error);
        
        if (req.files) {
            await Promise.all(
                req.files.map(file => 
                    fs.unlink(file.path).catch(err => console.error('Error deleting file:', err))
                )
            );
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload quality proof',
            error: error.message
        });
    }
};
