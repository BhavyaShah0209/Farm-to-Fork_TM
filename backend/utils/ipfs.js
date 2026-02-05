const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_API_JWT = process.env.PINATA_API_JWT;

/**
 * Upload a file to IPFS via Pinata
 * @param {string} filePath - Path to the file to upload
 * @param {string} fileName - Name for the file on IPFS
 * @returns {Promise<{hash: string, url: string}>}
 */
async function uploadFileToIPFS(filePath, fileName) {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath), fileName);

        const metadata = JSON.stringify({
            name: fileName,
        });
        formData.append('pinataMetadata', metadata);

        const options = JSON.stringify({
            cidVersion: 0,
        });
        formData.append('pinataOptions', options);

        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                maxBodyLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'Authorization': `Bearer ${PINATA_API_JWT}`
                }
            }
        );

        return {
            hash: response.data.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
        };
    } catch (error) {
        console.error('Error uploading file to IPFS:', error.response?.data || error.message);
        throw new Error('Failed to upload file to IPFS');
    }
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param {Object} jsonData - JSON object to upload
 * @param {string} pinataMetadata - Optional metadata
 * @returns {Promise<{hash: string, url: string}>}
 */
async function uploadJSONToIPFS(jsonData, pinataMetadata = {}) {
    try {
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            jsonData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PINATA_API_JWT}`
                },
                params: {
                    pinataMetadata: JSON.stringify(pinataMetadata)
                }
            }
        );

        return {
            hash: response.data.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
        };
    } catch (error) {
        console.error('Error uploading JSON to IPFS:', error.response?.data || error.message);
        throw new Error('Failed to upload JSON to IPFS');
    }
}

/**
 * Upload multiple files to IPFS
 * @param {Array} files - Array of file objects with path and name
 * @returns {Promise<Array<{hash: string, url: string, fileName: string}>>}
 */
async function uploadMultipleFiles(files) {
    try {
        const uploadPromises = files.map(file => 
            uploadFileToIPFS(file.path, file.name)
                .then(result => ({ ...result, fileName: file.name }))
        );
        
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading multiple files to IPFS:', error.message);
        throw new Error('Failed to upload multiple files to IPFS');
    }
}

/**
 * Get data from IPFS using hash
 * @param {string} hash - IPFS hash
 * @returns {Promise<any>}
 */
async function getFromIPFS(hash) {
    try {
        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
        return response.data;
    } catch (error) {
        console.error('Error getting data from IPFS:', error.message);
        throw new Error('Failed to get data from IPFS');
    }
}

/**
 * Get IPFS URL for a hash
 * @param {string} hash - IPFS hash
 * @returns {string}
 */
function getIPFSUrl(hash) {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

/**
 * Pin existing IPFS hash to Pinata
 * @param {string} hash - IPFS hash to pin
 * @param {string} name - Name for the pin
 * @returns {Promise<Object>}
 */
async function pinByHash(hash, name) {
    try {
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinByHash',
            {
                hashToPin: hash,
                pinataMetadata: {
                    name: name
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PINATA_API_JWT}`
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error pinning hash to Pinata:', error.response?.data || error.message);
        throw new Error('Failed to pin hash to Pinata');
    }
}

/**
 * Unpin file from Pinata
 * @param {string} hash - IPFS hash to unpin
 * @returns {Promise<void>}
 */
async function unpinFile(hash) {
    try {
        await axios.delete(
            `https://api.pinata.cloud/pinning/unpin/${hash}`,
            {
                headers: {
                    'Authorization': `Bearer ${PINATA_API_JWT}`
                }
            }
        );
    } catch (error) {
        console.error('Error unpinning file from Pinata:', error.response?.data || error.message);
        throw new Error('Failed to unpin file from Pinata');
    }
}

module.exports = {
    uploadFileToIPFS,
    uploadJSONToIPFS,
    uploadMultipleFiles,
    getFromIPFS,
    getIPFSUrl,
    pinByHash,
    unpinFile
};
