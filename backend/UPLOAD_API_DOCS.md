# File Upload API Documentation

## Overview

This API enables farmers and other users to upload files (images, PDFs) to IPFS (InterPlanetary File System) via Pinata. Files are stored decentralized and the IPFS hash is returned for blockchain storage.

## Base URL

```
http://localhost:5000/api/upload
```

## Authentication

All upload endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Upload Single File

**POST** `/single`

Upload a single file to IPFS.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**

- `file` (file, required): The file to upload

**Allowed File Types:**

- JPEG (.jpg, .jpeg)
- PNG (.png)
- PDF (.pdf)

**Max File Size:** 10MB

**Success Response (200):**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "ipfsHash": "QmXxxx...",
    "url": "https://gateway.pinata.cloud/ipfs/QmXxxx...",
    "fileName": "receipt.jpg",
    "fileSize": 245678,
    "mimeType": "image/jpeg"
  }
}
```

**Example (cURL):**

```bash
curl -X POST http://localhost:5000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.jpg"
```

---

### 2. Upload Multiple Files

**POST** `/multiple`

Upload multiple files (up to 10) to IPFS at once.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**

- `files` (multiple files, required): Files to upload (max 10)

**Success Response (200):**

```json
{
  "success": true,
  "message": "3 files uploaded successfully",
  "data": [
    {
      "ipfsHash": "QmXxxx...",
      "url": "https://gateway.pinata.cloud/ipfs/QmXxxx...",
      "fileName": "receipt1.jpg",
      "fileSize": 245678,
      "mimeType": "image/jpeg"
    },
    {
      "ipfsHash": "QmYyyy...",
      "url": "https://gateway.pinata.cloud/ipfs/QmYyyy...",
      "fileName": "receipt2.jpg",
      "fileSize": 198234,
      "mimeType": "image/jpeg"
    }
  ]
}
```

**Example (cURL):**

```bash
curl -X POST http://localhost:5000/api/upload/multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.jpg" \
  -F "files=@/path/to/file3.pdf"
```

---

### 3. Upload Quality Proof

**POST** `/quality-proof`

Upload quality proof documents (pesticide/fertilizer receipts, certificates) for a specific batch.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**

- `files` (multiple files, required): Proof documents (max 5)
- `batchId` (string, required): Blockchain batch ID
- `proofType` (string, required): Type of proof (e.g., "pesticide", "fertilizer", "certificate")

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quality proof uploaded successfully",
  "data": {
    "batchId": "0x123abc...",
    "proofType": "pesticide",
    "files": [
      {
        "ipfsHash": "QmXxxx...",
        "url": "https://gateway.pinata.cloud/ipfs/QmXxxx...",
        "fileName": "pesticide_0x123abc_receipt.jpg",
        "fileSize": 245678
      }
    ]
  }
}
```

**Example (cURL):**

```bash
curl -X POST http://localhost:5000/api/upload/quality-proof \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/receipt.jpg" \
  -F "batchId=0x123abc" \
  -F "proofType=pesticide"
```

---

### 4. Get File URL

**GET** `/:hash`

Get the IPFS gateway URL for a specific hash.

**Parameters:**

- `hash` (path parameter, required): IPFS hash

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "ipfsHash": "QmXxxx...",
    "url": "https://gateway.pinata.cloud/ipfs/QmXxxx..."
  }
}
```

**Example:**

```
GET http://localhost:5000/api/upload/QmXxxx...
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "No file uploaded"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

### 413 File Too Large

```json
{
  "success": false,
  "message": "File size is too large. Maximum size is 10MB."
}
```

### 415 Unsupported File Type

```json
{
  "success": false,
  "message": "Only JPEG, PNG, and PDF files are allowed!"
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Failed to upload file",
  "error": "Error details"
}
```

---

## Integration with Smart Contract

After uploading files, use the returned IPFS hashes in your smart contract:

```javascript
// Example: Add quality check with proof photos
const proofHashes = uploadedFiles.map((file) => file.ipfsHash);

await contract.addQualityCheck(
  batchId,
  ["Pesticide A", "Pesticide B"],
  ["Fertilizer X"],
  proofHashes, // Array of IPFS hashes
  certificationHash,
);
```

---

## Frontend Integration Example

### React/JavaScript Example

```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:5000/api/upload/single", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.data.ipfsHash;
};

// Usage in component
const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  try {
    const ipfsHash = await uploadFile(file);
    console.log("File uploaded to IPFS:", ipfsHash);
    // Store hash in your state or send to smart contract
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### Multiple Files Upload

```javascript
const uploadMultipleFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch("http://localhost:5000/api/upload/multiple", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.data.map((file) => file.ipfsHash);
};
```

---

## Testing

Use the provided `test-upload.http` file with REST Client extension in VS Code, or use Postman.

### Test Checklist:

1. ✅ Upload single image
2. ✅ Upload single PDF
3. ✅ Upload multiple files
4. ✅ Upload quality proof with batchId
5. ✅ Get file URL from hash
6. ✅ Test file size limit (>10MB)
7. ✅ Test unsupported file type
8. ✅ Test without authentication

---

## Notes

- Files are temporarily stored in `backend/uploads/` folder
- After successful IPFS upload, local files are automatically deleted
- IPFS hashes are permanent and immutable
- Use returned IPFS hashes in your blockchain smart contract
- Pinata gateway URL format: `https://gateway.pinata.cloud/ipfs/{hash}`
- Consider adding file validation on frontend before upload
- Monitor Pinata dashboard for storage usage and pinned files

---

## Environment Variables Required

```env
PINATA_API_JWT=your_pinata_jwt_token_here
```

Get your Pinata JWT from: https://app.pinata.cloud/keys
