// IPFS Integration using Pinata
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Get Pinata JWT from environment
const PINATA_JWT = process.env.PINATA_API_JWT;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'gateway.pinata.cloud';

/**
 * Upload file to IPFS via Pinata
 * @param {String} filePath - Path to file on disk
 * @param {String} originalName - Original filename
 * @returns {String} IPFS hash (CID)
 */
const uploadFileToIPFS = async (filePath, originalName) => {
  try {
    if (!PINATA_JWT) {
      console.warn('⚠️ PINATA_API_JWT not set. Using placeholder.');
      return `QmPlaceholder${Date.now()}`;
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    // Add metadata
    const metadata = JSON.stringify({
      name: originalName,
      keyvalues: {
        uploadedAt: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders()
        }
      }
    );

    console.log(`✅ File uploaded to IPFS: ${response.data.IpfsHash}`);
    return response.data.IpfsHash; // Returns CID like "QmXxx..."
  } catch (error) {
    console.error('IPFS Upload Error:', error.response?.data || error.message);
    throw new Error('Failed to upload file to IPFS');
  }
};

/**
 * Upload JSON data to IPFS
 * @param {Object} jsonData - JSON object to upload
 * @returns {String} IPFS hash (CID)
 */
const uploadJSONToIPFS = async (jsonData) => {
  try {
    if (!PINATA_JWT) {
      console.warn('⚠️ PINATA_API_JWT not set. Using placeholder.');
      return `QmJSONPlaceholder${Date.now()}`;
    }

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      jsonData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ JSON uploaded to IPFS: ${response.data.IpfsHash}`);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('IPFS JSON Upload Error:', error.response?.data || error.message);
    throw new Error('Failed to upload JSON to IPFS');
  }
};

/**
 * Get file URL from IPFS hash
 * @param {String} hash - IPFS hash (CID)
 * @returns {String} Public gateway URL
 */
const getIPFSUrl = (hash) => {
  return `https://${PINATA_GATEWAY}/ipfs/${hash}`;
};

/**
 * Fetch data from IPFS
 * @param {String} hash - IPFS hash (CID)
 * @returns {Object} Data from IPFS
 */
const getFromIPFS = async (hash) => {
  try {
    const url = getIPFSUrl(hash);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('IPFS Fetch Error:', error.message);
    throw new Error('Failed to fetch from IPFS');
  }
};

/**
 * Upload multiple files to IPFS
 * @param {Array} files - Array of file objects with path and originalname
 * @returns {Array} Array of IPFS hashes
 */
const uploadMultipleFiles = async (files) => {
  const uploadPromises = files.map(file => 
    uploadFileToIPFS(file.path, file.originalname)
  );
  return await Promise.all(uploadPromises);
};

module.exports = {
  uploadFileToIPFS,
  uploadJSONToIPFS,
  uploadMultipleFiles,
  getFromIPFS,
  getIPFSUrl
};
