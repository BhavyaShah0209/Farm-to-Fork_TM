# IPFS Data Schema for Farm-to-Fork Traceability

## Overview

This document defines the data structure and schema for all files stored on IPFS in the Farm-to-Fork traceability system. IPFS (InterPlanetary File System) is used for decentralized storage of images, documents, and metadata.

---

## 📁 File Types Stored on IPFS

### 1. **Product/Listing Images**

### 2. **Quality Check Proof Photos**

### 3. **Certification Documents**

### 4. **Batch Metadata**

### 5. **User Profile Photos** (Optional)

---

## 🗂️ Data Structures

### 1. Product/Listing Metadata

**File Type:** JSON  
**Stored When:** Creating a new listing  
**Referenced In:** MongoDB `Listing` collection, Blockchain `dataHash`

```json
{
  "version": "1.0",
  "type": "listing_metadata",
  "timestamp": "2026-02-06T10:30:00.000Z",
  "listing": {
    "cropName": "Organic Tomatoes",
    "variety": "Cherry Tomatoes",
    "quantity": 100,
    "unit": "kg",
    "pricePerKg": 50,
    "harvestDate": "2026-02-01",
    "expiryDate": "2026-02-15",
    "originLocation": {
      "farm": "Green Valley Farm",
      "village": "Pune Rural",
      "district": "Pune",
      "state": "Maharashtra",
      "country": "India",
      "coordinates": {
        "latitude": 18.5204,
        "longitude": 73.8567
      }
    },
    "images": [
      "QmProductImage1Hash...",
      "QmProductImage2Hash...",
      "QmProductImage3Hash..."
    ],
    "description": "Fresh organic tomatoes grown without synthetic pesticides",
    "farmerId": "65f1111111111111111111111",
    "farmerName": "John Farmer"
  }
}
```

**IPFS Hash Example:** `QmYwAPJzv5CZsnA5wqvWqCZ3iGh5fHH7pE9rqbGMF3vwLx`

---

### 2. Product Images

**File Type:** JPEG/PNG  
**Max Size:** 5MB per image  
**Recommended Resolution:** 1200x1200px  
**Stored When:** Farmer uploads product photos

**Image Types:**

- Product photos (harvest, packaging)
- Farm photos
- Close-up shots

**Naming Convention:**

```
product_[batchId]_[timestamp]_[index].jpg
```

**IPFS Hash Example:** `QmXg9Pp2ytZ62vyZuvp8N6m9s2Y1W5kLZzPu6M6YKHLpC7`

---

### 3. Quality Check Data

**File Type:** JSON  
**Stored When:** Farmer adds quality information  
**Referenced In:** Smart Contract `qualityData`

```json
{
  "version": "1.0",
  "type": "quality_check",
  "timestamp": "2026-02-06T10:45:00.000Z",
  "batchId": "BATCH-001-2026",
  "farmerId": "65f1111111111111111111111",
  "pesticides": [
    {
      "name": "Neem Oil",
      "type": "Organic",
      "brand": "EcoGrow",
      "applicationDate": "2026-01-15",
      "dosage": "50ml per 10L water",
      "purpose": "Aphid control"
    },
    {
      "name": "Bacillus thuringiensis",
      "type": "Biological",
      "brand": "BioPest",
      "applicationDate": "2026-01-20",
      "dosage": "As per label",
      "purpose": "Caterpillar control"
    }
  ],
  "fertilizers": [
    {
      "name": "Organic Compost",
      "type": "Organic",
      "brand": "FarmCompost",
      "applicationDate": "2026-01-10",
      "quantity": "500kg per acre",
      "npkRatio": "5-3-2"
    },
    {
      "name": "Vermicompost",
      "type": "Organic",
      "brand": "WormGold",
      "applicationDate": "2026-01-25",
      "quantity": "200kg per acre",
      "npkRatio": "2-1-1"
    }
  ],
  "proofPhotos": [
    "QmFertilizerBagPhoto1...",
    "QmReceiptPhoto1...",
    "QmApplicationPhoto1...",
    "QmPesticideBagPhoto1..."
  ],
  "certifications": ["QmOrganicCertHash...", "QmQualityCertHash..."],
  "soilTest": {
    "date": "2026-01-05",
    "ph": 6.5,
    "nitrogen": "Medium",
    "phosphorus": "High",
    "potassium": "Medium",
    "reportHash": "QmSoilTestReportHash..."
  },
  "waterSource": "Drip irrigation from well",
  "notes": "All inputs are organic certified. No synthetic chemicals used."
}
```

**IPFS Hash Example:** `QmPQvN4Y7Tb8KVH3L2X9rqbGMF3vwLxYwAPJzv5CZsnA5w`

---

### 4. Quality Proof Photos

**File Type:** JPEG/PNG  
**Max Size:** 5MB per image  
**Stored When:** Farmer uploads proof documents

**Photo Types:**

- Fertilizer bag/packaging photos
- Purchase receipts
- Application process photos
- Pesticide labels
- Field application photos

**Naming Convention:**

```
proof_[type]_[batchId]_[timestamp].jpg
```

Examples:

- `proof_fertilizer_BATCH001_1707217800.jpg`
- `proof_receipt_BATCH001_1707217850.jpg`
- `proof_application_BATCH001_1707217900.jpg`

**IPFS Hash Example:** `QmUxK9f3mQwN8Y7Tb8KVH3L2X9rqbGMF3vwLxYwAPJzv5C`

---

### 5. Certification Documents

**File Type:** PDF/JPEG  
**Max Size:** 10MB  
**Stored When:** Farmer uploads certificates

**Certificate Types:**

- Organic certification
- Quality certification
- Lab test reports
- Soil test reports
- Government certifications

```json
{
  "version": "1.0",
  "type": "certification",
  "timestamp": "2026-02-06T11:00:00.000Z",
  "certificate": {
    "type": "Organic Certification",
    "issuedBy": "India Organic Certification Agency",
    "certificateNumber": "IOCA/2026/12345",
    "issueDate": "2026-01-01",
    "expiryDate": "2027-01-01",
    "scope": "Organic vegetable cultivation",
    "farmerId": "65f1111111111111111111111",
    "farmerName": "John Farmer",
    "farmLocation": "Green Valley Farm, Pune",
    "documentHash": "QmCertificatePDFHash..."
  }
}
```

**IPFS Hash Example:** `QmRfN8Y7TbVH3L2X9rqbGMF3vwLxYwAPJzv5CZsnA5wPQ`

---

### 6. Batch Complete Metadata

**File Type:** JSON  
**Stored When:** Batch created on blockchain  
**Referenced In:** Smart Contract `dataHash`

```json
{
  "version": "1.0",
  "type": "batch_metadata",
  "timestamp": "2026-02-06T09:00:00.000Z",
  "batch": {
    "batchId": "BATCH-001-2026",
    "parentBatchId": null,
    "quantity": 100,
    "unit": "kg",
    "cropName": "Organic Tomatoes",
    "variety": "Cherry Tomatoes",
    "farmerId": "65f1111111111111111111111",
    "farmerDetails": {
      "name": "John Farmer",
      "mobile": "9876543210",
      "email": "john@farm.com",
      "farmName": "Green Valley Farm"
    },
    "cultivation": {
      "sowingDate": "2025-12-01",
      "harvestDate": "2026-02-01",
      "cultivationMethod": "Organic",
      "irrigationType": "Drip irrigation",
      "fieldArea": "2 acres"
    },
    "qualityDataHash": "QmQualityCheckDataHash...",
    "productMetadataHash": "QmProductMetadataHash...",
    "images": ["QmBatchImage1Hash...", "QmBatchImage2Hash..."]
  }
}
```

**IPFS Hash Example:** `QmWfN4Y7Tb8KVH3L2X9rqbGMF3vwLxYwAPJzv5CZsnA5w`

---

## 🔗 Integration Flow

### Step 1: Create Listing

```javascript
// 1. Upload product images to IPFS
const productImages = await uploadImagesToIPFS([image1, image2, image3]);
// Returns: ["QmImage1...", "QmImage2...", "QmImage3..."]

// 2. Create product metadata JSON
const metadata = {
  version: "1.0",
  type: "listing_metadata",
  listing: {
    cropName: "Tomatoes",
    images: productImages,
    // ... other details
  },
};

// 3. Upload metadata to IPFS
const metadataHash = await uploadJSONToIPFS(metadata);
// Returns: "QmMetadataHash..."

// 4. Save to MongoDB
await Listing.create({
  cropName: "Tomatoes",
  ipfsHash: metadataHash,
  // ... other fields
});

// 5. Create batch on blockchain
await blockchainContract.createBatch(
  batchId,
  quantity,
  farmerId,
  keccak256(metadataHash), // Store hash of IPFS hash
);
```

### Step 2: Add Quality Check

```javascript
// 1. Upload proof photos to IPFS
const proofPhotos = await uploadImagesToIPFS([
  fertilizerBagPhoto,
  receiptPhoto,
  applicationPhoto
]);

// 2. Upload certificates to IPFS
const certHash = await uploadPDFToIPFS(organicCertificate);

// 3. Create quality data JSON
const qualityData = {
  version: "1.0",
  type: "quality_check",
  pesticides: [...],
  fertilizers: [...],
  proofPhotos: proofPhotos,
  certifications: [certHash]
};

// 4. Upload quality data to IPFS
const qualityHash = await uploadJSONToIPFS(qualityData);

// 5. Add to blockchain
await blockchainContract.addQualityCheck(
  batchId,
  ["Pesticide 1", "Pesticide 2"],
  ["Fertilizer 1", "Fertilizer 2"],
  proofPhotos,
  certHash
);

// 6. Update MongoDB batch record
await Batch.updateOne(
  { batchId },
  { qualityDataHash: qualityHash }
);
```

### Step 3: Retrieve and Display

```javascript
// 1. Get batch from blockchain
const batchData = await blockchainContract.getBatch(batchId);
const qualityData = await blockchainContract.getQualityCheck(batchId);

// 2. Retrieve metadata from IPFS
const metadata = await fetchFromIPFS(batchData.dataHash);
const qualityInfo = await fetchFromIPFS(qualityData.certificationHash);

// 3. Display images
qualityData.proofPhotos.forEach((hash) => {
  const imageUrl = `https://ipfs.io/ipfs/${hash}`;
  // or use gateway: `https://gateway.pinata.cloud/ipfs/${hash}`
});
```

---

## 📊 File Size Recommendations

| File Type       | Max Size | Recommended Size | Format             |
| --------------- | -------- | ---------------- | ------------------ |
| Product Image   | 5 MB     | 500 KB - 1 MB    | JPEG (85% quality) |
| Proof Photo     | 5 MB     | 500 KB - 1 MB    | JPEG (85% quality) |
| Certificate PDF | 10 MB    | 1-3 MB           | PDF                |
| Metadata JSON   | 1 MB     | 10-100 KB        | JSON               |
| Profile Photo   | 2 MB     | 100-300 KB       | JPEG               |

---

## 🔐 Security & Privacy

### Data Encryption (Optional)

For sensitive documents, encrypt before uploading:

```javascript
// Encrypt sensitive data
const encryptedData = await encryptData(sensitiveDocument, encryptionKey);
const ipfsHash = await uploadToIPFS(encryptedData);

// Store encryption key securely (not on IPFS)
await storeKeyInDatabase(batchId, encryptionKey);
```

### Access Control

- Public data: Product images, basic metadata
- Private data: Detailed financial records, personal information
- Restricted data: Lab reports (only viewable by buyer after purchase)

---

## 🛠️ Implementation Code

### Backend IPFS Utility Functions

```javascript
// backend/utils/ipfs.js

const { create } = require("ipfs-http-client");
const fs = require("fs");

// Connect to IPFS node (local or Pinata/Infura)
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: "Bearer YOUR_PROJECT_SECRET",
  },
});

// Upload file to IPFS
async function uploadFileToIPFS(filePath) {
  const file = fs.readFileSync(filePath);
  const result = await ipfs.add(file);
  return result.path; // Returns IPFS hash
}

// Upload JSON data to IPFS
async function uploadJSONToIPFS(jsonData) {
  const jsonString = JSON.stringify(jsonData, null, 2);
  const result = await ipfs.add(jsonString);
  return result.path;
}

// Upload multiple images
async function uploadMultipleImages(imageFiles) {
  const hashes = [];
  for (const file of imageFiles) {
    const hash = await uploadFileToIPFS(file.path);
    hashes.push(hash);
  }
  return hashes;
}

// Retrieve data from IPFS
async function fetchFromIPFS(hash) {
  const chunks = [];
  for await (const chunk of ipfs.cat(hash)) {
    chunks.push(chunk);
  }
  const data = Buffer.concat(chunks).toString();
  return JSON.parse(data);
}

// Pin file (prevent garbage collection)
async function pinFile(hash) {
  await ipfs.pin.add(hash);
  console.log(`Pinned ${hash}`);
}

module.exports = {
  uploadFileToIPFS,
  uploadJSONToIPFS,
  uploadMultipleImages,
  fetchFromIPFS,
  pinFile,
};
```

### Frontend Upload Component

```javascript
// frontend/js/ipfs-upload.js

async function uploadToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:5000/api/ipfs/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.ipfsHash; // Returns "QmXxx..."
}

// Display image from IPFS
function displayIPFSImage(hash, elementId) {
  const imageUrl = `https://ipfs.io/ipfs/${hash}`;
  document.getElementById(elementId).src = imageUrl;
}

// Upload multiple files
async function uploadMultipleFiles(files) {
  const hashes = [];
  for (const file of files) {
    const hash = await uploadToIPFS(file);
    hashes.push(hash);
  }
  return hashes;
}
```

---

## 🌐 IPFS Gateways

### Public Gateways

- `https://ipfs.io/ipfs/{hash}`
- `https://gateway.pinata.cloud/ipfs/{hash}`
- `https://cloudflare-ipfs.com/ipfs/{hash}`
- `https://dweb.link/ipfs/{hash}`

### Private/Paid Services

- **Pinata** - Reliable pinning service
- **Infura** - IPFS API endpoint
- **Web3.Storage** - Free for developers
- **NFT.Storage** - Free, optimized for NFTs

---

## 📝 Database Schema (MongoDB)

### Linking IPFS Hashes in MongoDB

```javascript
// models/Batch.js
const batchSchema = new mongoose.Schema({
  batchId: String,
  quantity: Number,
  farmerId: ObjectId,

  // IPFS References
  ipfsMetadataHash: String, // Main batch metadata
  qualityDataHash: String, // Quality check data
  productImageHashes: [String], // Product images
  proofPhotoHashes: [String], // Quality proof photos
  certificationHashes: [String], // Certificates

  // ... other fields
});

// models/Listing.js
const listingSchema = new mongoose.Schema({
  cropName: String,
  quantity: Number,

  // IPFS References
  ipfsMetadataHash: String,
  imageHashes: [String],

  // ... other fields
});
```

---

## 🔄 Data Synchronization

### Keep Blockchain and IPFS in Sync

```javascript
// When creating batch
async function createBatchWithIPFS(batchData) {
  // 1. Upload to IPFS
  const ipfsHash = await uploadJSONToIPFS(batchData);

  // 2. Store on blockchain
  const dataHash = web3.utils.keccak256(ipfsHash);
  await contract.createBatch(
    batchData.batchId,
    batchData.quantity,
    batchData.farmerId,
    dataHash,
  );

  // 3. Store in MongoDB
  await Batch.create({
    ...batchData,
    ipfsMetadataHash: ipfsHash,
    blockchainDataHash: dataHash,
  });
}

// Verify data integrity
async function verifyDataIntegrity(batchId) {
  // Get from blockchain
  const blockchainData = await contract.getBatch(batchId);

  // Get IPFS hash from MongoDB
  const batch = await Batch.findOne({ batchId });

  // Verify hash matches
  const computedHash = web3.utils.keccak256(batch.ipfsMetadataHash);

  if (computedHash === blockchainData.dataHash) {
    console.log("✅ Data integrity verified");
    return true;
  } else {
    console.error("❌ Data integrity violation");
    return false;
  }
}
```

---

## 📋 Summary

This IPFS schema provides a comprehensive structure for storing and retrieving all data in the Farm-to-Fork traceability system:

✅ **Product images** - High-quality photos of produce  
✅ **Quality data** - Detailed pesticide/fertilizer usage  
✅ **Proof photos** - Evidence of claims (receipts, bags, applications)  
✅ **Certificates** - Organic and quality certifications  
✅ **Metadata** - Complete batch and listing information  
✅ **Integrity** - Hash verification with blockchain

**Last Updated:** February 6, 2026
