import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Market() { // Simplified: one unified view for now
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    setUser(userData);
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.get('/api/listings', config);
      setListings(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      // If 401, maybe redirect to login or show empty
      if (err.response && err.response.status === 401) {
        // navigate('/login'); // Optional: Force login
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const getTimeAgo = (date) => {
    const diff = new Date() - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  }

  return (
    <div className="container" style={{ display: 'block' }}> {/* Override flex default from App.css */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🛒 Fresh Market</h2>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Welcome, <strong>{user.name}</strong> ({user.role})</span>
            {user.role === 'farmer' && (
              <Link to="/farmer-dashboard" className="btn btn-green" style={{ width: 'auto', fontSize: '0.8rem', backgroundColor: '#27ae60' }}>
                + Post New Batch
              </Link>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn btn-blue" style={{ width: 'auto', fontSize: '0.9rem' }}>Login</Link>
        )}
      </div>

      {loading ? (
        <p>Loading market data...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {listings.map(l => (
            <Link to={`/listing/${l._id}`} key={l._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card market-card" style={{ height: '100%', padding: '0', border: 'none', overflow: 'hidden' }}>
                {l.batch?.imageUrl ? (
                  <img
                    src={l.batch.imageUrl}
                    alt={l.batch.cropName}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    style={{
                      width: '100%',
                      height: '160px',
                      objectFit: 'cover'
                    }}
                  />
                ) : null}

                <div style={{
                  height: '160px',
                  background: 'linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)',
                  display: l.batch?.imageUrl ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                }}>
                  🥔
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>{l.batch?.cropName || 'Produce'}</h3>
                    <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                      {l.quantityAvailable} kg left
                    </span>
                  </div>

                  <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.9rem' }}>
                    By {l.seller?.name || 'Unknown'}
                  </p>

                  <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#999', display: 'block' }}>Price</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#00d09c' }}>₹{l.pricePerKg}/kg</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#bdc3c7' }}>
                      {getTimeAgo(l.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {listings.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
              <h3>No listings available currently.</h3>
              <p>Farmers haven't posted any produce yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
