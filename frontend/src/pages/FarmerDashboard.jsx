import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    pricePerKg: '',
    originLocation: 'Farm A, Sector 1', // Default or user input
    harvestDate: new Date().toISOString().split('T')[0], // Default to today
    fertilizers: '', // New
    pesticides: '', // New
    proofImageUrl: '', // New
    fertilizerProofUrl: '', // New
    pesticideProofUrl: '', // New
    imageUrl: '' // New
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // New for file upload status
  const [message, setMessage] = useState({ type: '', text: '' });
  const [myListings, setMyListings] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    if (!userData || userData.role !== 'farmer') {
      navigate('/');
      return;
    }
    setUser(userData);
    fetchMyListings();
  }, [navigate]);

  const fetchMyListings = async () => {
    try {
      const token = localStorage.getItem('token');
      // Ideally backend filters standard getListings for me, or I filter client side if not.
      // The current backend listingController.js `getListings` returns all active listings.
      // Let's assume for now we filter here or just show what's returned.
      // Wait, let's just make a specialized call or filter.
      const res = await axios.get('/api/listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter for my own listings
      const userData = JSON.parse(localStorage.getItem('currentUser'));
      const myOwn = res.data.filter(l => {
        // Robust check: Handle string vs object ID, and populated field
        const sellerId = l.seller?._id || l.seller; // Handle populated or raw ID
        return sellerId == userData._id || (l.seller?.name === userData.name);
      });
      setMyListings(myOwn);
    } catch (err) {
      console.error("Failed to fetch listings", err);
    }
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: 'info', text: 'Uploading to IPFS...' });

    const data = new FormData();
    data.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/upload/single', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setFormData(prev => ({ ...prev, [fieldName]: res.data.data.url }));
      setMessage({ type: 'success', text: 'Upload successful!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Upload failed. Try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      // Convert comma-separated string to array for backend
      const payload = {
        ...formData,
        fertilizers: formData.fertilizers.split(',').map(s => s.trim()).filter(Boolean),
        pesticides: formData.pesticides.split(',').map(s => s.trim()).filter(Boolean)
      };

      await axios.post('/api/listings/create', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Batch Created & Listed Successfully!' });
      setFormData({
        cropName: '',
        quantity: '',
        pricePerKg: '',
        originLocation: 'Farm A, Sector 1',
        harvestDate: new Date().toISOString().split('T')[0],
        fertilizers: '',
        pesticides: '',
        proofImageUrl: '',
        fertilizerProofUrl: '',
        pesticideProofUrl: '',
        imageUrl: ''
      });
      fetchMyListings(); // Refresh list
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create listing' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <button className="btn btn-blue" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        ← Back to Market
      </button>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

        {/* Create Listing Form */}
        <div style={{ flex: '1', minWidth: '350px' }}>
          <div className="card" style={{ background: 'white', padding: '25px' }}>
            <h2 style={{ color: '#27ae60', marginTop: 0 }}>👨‍🌾 Farmer Dashboard</h2>
            <p>Post a new harvest batch to the market.</p>

            {message.text && (
              <div style={{
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24'
              }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label>Crop Name</label>
                <input
                  type="text" name="cropName" required
                  value={formData.cropName} onChange={handleChange}
                  placeholder="e.g. Organic Potatoes"
                  className="form-input"
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Crop Image</label>
                <input
                  type="file" accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'imageUrl')}
                  disabled={uploading}
                  style={{ marginTop: '5px' }}
                />
                {formData.imageUrl && <small style={{ display: 'block', color: 'green', marginTop: '5px' }}>✓ Image Uploaded Check</small>}
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label>Quantity (kg)</label>
                  <input
                    type="number" name="quantity" required
                    value={formData.quantity} onChange={handleChange}
                    placeholder="100"
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Price (₹/kg)</label>
                  <input
                    type="number" name="pricePerKg" required
                    value={formData.pricePerKg} onChange={handleChange}
                    placeholder="50"
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Harvest Date</label>
                <input
                  type="date" name="harvestDate" required
                  value={formData.harvestDate} onChange={handleChange}
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                />
              </div>

              {/* === Quality Check Section === */}
              <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px', border: '1px dashed #ccc', marginBottom: '20px' }}>
                <h4 style={{ marginTop: 0, color: '#555' }}>✅ Quality & Safety Check</h4>
                <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic', marginBottom: '15px' }}>
                  Disclaimer: Please upload valid receipts of purchase or photos of the actual fertilizer/pesticide bags used.
                  These documents verify the authenticity of your organic/safety claims.
                </p>

                <div style={{ marginBottom: '15px' }}>
                  <label>Fertilizers Used (comma separated)</label>
                  <input
                    type="text"
                    name="fertilizers"
                    placeholder="e.g. Urea, DAP, Organic Compost"
                    value={formData.fertilizers}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                  />
                  <div style={{ marginTop: '10px', paddingLeft: '10px', borderLeft: '3px solid #eee' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Upload Fertilizer Receipt/Photo:</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'fertilizerProofUrl')}
                      disabled={uploading}
                      style={{ marginTop: '5px', display: 'block' }}
                    />
                    {formData.fertilizerProofUrl && <small style={{ display: 'block', color: 'green', marginTop: '2px' }}>✓ Fertilizer Proof Uploaded</small>}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label>Pesticides Used (comma separated)</label>
                  <input
                    type="text"
                    name="pesticides"
                    placeholder="e.g. Neem Oil, None"
                    value={formData.pesticides}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                  />
                  <div style={{ marginTop: '10px', paddingLeft: '10px', borderLeft: '3px solid #eee' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Upload Pesticide Receipt/Photo:</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'pesticideProofUrl')}
                      disabled={uploading}
                      style={{ marginTop: '5px', display: 'block' }}
                    />
                    {formData.pesticideProofUrl && <small style={{ display: 'block', color: 'green', marginTop: '2px' }}>✓ Pesticide Proof Uploaded</small>}
                  </div>
                </div>

                <div style={{ marginBottom: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <label>Other Proof Document / Certificate (Optional)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, 'proofImageUrl')}
                    disabled={uploading}
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                  />
                  {formData.proofImageUrl && <small style={{ display: 'block', color: 'green' }}>✓ Certificate Uploaded</small>}
                  <small style={{ color: '#888', display: 'block' }}>Upload a quality certificate or lab report.</small>
                </div>
              </div>
              {/* === End Quality Check === */}

              <div style={{ marginBottom: '15px' }}>
                <label>Origin Location</label>
                <input
                  type="text" name="originLocation" required
                  value={formData.originLocation} onChange={handleChange}
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                />
              </div>

              <button type="submit" className="btn btn-green" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Processing...' : '🚀 Release to Market'}
              </button>
            </form>
          </div>
        </div>

        {/* My Active Listings */}
        <div style={{ flex: '1', minWidth: '350px' }}>
          <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>My Active Batches</h3>

          {myListings.length === 0 ? (
            <p style={{ color: '#7f8c8d' }}>You haven't posted any active batches yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {myListings.map(l => (
                <div key={l._id} className="card" style={{ padding: '15px', borderLeft: '5px solid #27ae60' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: 0 }}>{l.batch?.cropName}</h4>
                    <span className="badge badge-transferred">Active</span>
                  </div>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                    Stock: <strong>{l.quantityAvailable} kg</strong> | Price: <strong>₹{l.pricePerKg}/kg</strong>
                  </p>
                  <small style={{ color: '#95a5a6' }}>Batch ID: {l.batch?.batchId}</small>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
