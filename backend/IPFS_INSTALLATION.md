# IPFS Integration Setup Guide

## 🚀 Quick Start

### Step 1: Install Required Packages

```bash
cd backend
npm install multer form-data axios
```

**Packages:**

- `multer` - Handle multipart/form-data for file uploads
- `form-data` - Create form data for Pinata API
- `axios` - HTTP client for API requests

---

### Step 2: Get Pinata API Key

1. Go to [Pinata Cloud](https://app.pinata.cloud)
2. Sign up for free account (1GB storage free)
3. Navigate to **API Keys** section
4. Click **New Key**
5. Select permissions:
   - ✅ pinFileToIPFS
   - ✅ pinJSONToIPFS
   - ✅ unpin
6. Give it a name (e.g., "Farm-to-Fork API")
7. Click **Create Key**
8. **Copy the JWT token** (you can only see it once!)

---

### Step 3: Add Environment Variable

Open `backend/.env` and add:

```env
PINATA_API_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_jwt_here
```

**Important:** Replace with your actual JWT from Pinata

---

### Step 4: Register Upload Routes

The upload routes should already be registered in `server.js`. Verify this line exists:

```javascript
app.use("/api/upload", require("./routes/uploadRoutes"));
```

If not present, add it after other route registrations.

---

### Step 5: Verify File Structure

Make sure these files exist:

```
backend/
├── utils/
│   └── ipfs.js ✅
├── controllers/
│   └── uploadController.js ✅
├── routes/
│   └── uploadRoutes.js ✅
├── uploads/
│   └── .gitkeep ✅
└── .env (with PINATA_API_JWT)
```

---

## 🧪 Testing

### Test 1: Start Server

```bash
cd backend
npm start
```

Expected output:

```
Server running on port 5000
MongoDB Connected: cluster0...
```

---

### Test 2: Test Upload API

**Using cURL:**

```bash
# First, get a JWT token by logging in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Copy the token from response, then upload a file
curl -X POST http://localhost:5000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/test-image.jpg"
```

**Using Postman:**

See instructions in `test-upload.http` file.

---

### Test 3: Verify IPFS Upload

After successful upload, you'll get response like:

```json
{
  "success": true,
  "data": {
    "ipfsHash": "QmXxxx...",
    "url": "https://gateway.pinata.cloud/ipfs/QmXxxx..."
  }
}
```

**Verify:**

1. Copy the URL from response
2. Open it in browser
3. You should see your uploaded file

---

## 🔧 Troubleshooting

### Error: "Failed to upload file to IPFS"

**Possible causes:**

1. Invalid or missing `PINATA_API_JWT` in `.env`
2. API key doesn't have correct permissions
3. Network issues connecting to Pinata

**Solution:**

- Verify JWT token is correct in `.env`
- Check Pinata dashboard for API key status
- Test Pinata API directly:
  ```bash
  curl -X GET https://api.pinata.cloud/data/testAuthentication \
    -H "Authorization: Bearer YOUR_JWT"
  ```

---

### Error: "Only JPEG, PNG, and PDF files are allowed!"

**Cause:** Trying to upload unsupported file type

**Solution:** Only upload `.jpg`, `.jpeg`, `.png`, or `.pdf` files

---

### Error: "File size is too large"

**Cause:** File exceeds 10MB limit

**Solution:**

- Compress images before upload
- Or increase limit in `uploadRoutes.js`:
  ```javascript
  limits: {
    fileSize: 20 * 1024 * 1024; // 20MB
  }
  ```

---

### Error: "ENOENT: no such file or directory, open 'uploads/...'"

**Cause:** `uploads/` folder doesn't exist

**Solution:**

```bash
mkdir backend/uploads
```

---

### Error: "Not authorized, token failed"

**Cause:** Invalid or missing JWT token

**Solution:**

- Login to get a valid token
- Make sure to include `Authorization: Bearer <token>` header
- Check token hasn't expired

---

## 📝 Usage in Your Application

### Frontend Upload Component

```javascript
// React component for file upload
const UploadProof = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload/single", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();
      setIpfsHash(data.data.ipfsHash);
      alert("File uploaded to IPFS!");
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload to IPFS"}
      </button>
      {ipfsHash && <p>IPFS Hash: {ipfsHash}</p>}
    </div>
  );
};
```

---

### Integrate with Smart Contract

After uploading files, use the IPFS hashes in your smart contract:

```javascript
// 1. Upload proof photos
const uploadedFiles = await uploadMultipleFiles([receipt1, receipt2]);
const ipfsHashes = uploadedFiles.map((f) => f.ipfsHash);

// 2. Add quality check to blockchain
const contract = new ethers.Contract(contractAddress, ABI, signer);
await contract.addQualityCheck(
  batchId,
  ["Pesticide A"],
  ["Fertilizer X"],
  ipfsHashes, // Array of IPFS hashes
  certificationHash,
);

// 3. Later, retrieve and display images
const qualityData = await contract.getQualityCheck(batchId);
const proofUrls = qualityData.proofPhotos.map(
  (hash) => `https://gateway.pinata.cloud/ipfs/${hash}`,
);
```

---

## 🎯 Next Steps

1. ✅ Install packages: `npm install multer form-data axios`
2. ✅ Get Pinata API key from https://app.pinata.cloud
3. ✅ Add `PINATA_API_JWT` to `.env`
4. ✅ Test upload with Postman or cURL
5. ⏳ Create frontend upload component
6. ⏳ Integrate with smart contract
7. ⏳ Deploy smart contract to testnet
8. ⏳ Test end-to-end flow

---

## 📚 Additional Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Multer Documentation](https://github.com/expressjs/multer)
- Full API docs: See `UPLOAD_API_DOCS.md`
- Test file: See `test-upload.http`

---

## 💡 Tips

- Use descriptive filenames for better organization on IPFS
- Consider image compression before upload to save storage
- Store IPFS hashes in MongoDB for quick reference
- Use Pinata's pin policies to manage storage
- Monitor your Pinata usage dashboard regularly
- Consider CDN for faster image delivery
- Implement retry logic for failed uploads
- Add progress tracking for large file uploads

---

## 🔐 Security Notes

- Never expose your Pinata JWT token in frontend code
- Always validate file types on backend
- Implement rate limiting for upload endpoints
- Scan uploaded files for malware if needed
- Use signed URLs for sensitive content
- Implement user upload quotas
- Log all upload activities for audit

---

## 📊 Pinata Free Tier Limits

- Storage: 1 GB
- Bandwidth: 100 GB/month
- Pin Requests: 100/month
- Gateway Requests: Unlimited

Upgrade if you need more: https://www.pinata.cloud/pricing
