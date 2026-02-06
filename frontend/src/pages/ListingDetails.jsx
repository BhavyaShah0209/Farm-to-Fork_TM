import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ListingDetails.css';

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(10);
  const [purchaseMsg, setPurchaseMsg] = useState('');

  // Seller Management State
  const [editMode, setEditMode] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [isListingActive, setIsListingActive] = useState(false);

  // Real Chat State
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);
    if (!user) {
      navigate('/login');
      return;
    }
    fetchListing();
  }, [id, navigate]);

  // Poll for messages if chat is open
  useEffect(() => {
    let interval;
    if (showChat && chatId) {
      interval = setInterval(fetchChatMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [showChat, chatId]);

  const fetchListing = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListing(res.data);
      setNewPrice(res.data.pricePerKg);
      setIsListingActive(res.data.isActive);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch listing');
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    // ... (Existing Buy Logic)
    if (!buyQuantity || buyQuantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    if (buyQuantity > listing.quantityAvailable) {
      alert(`Only ${listing.quantityAvailable} kg available!`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/orders/create', {
        listingId: listing._id,
        quantity: buyQuantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPurchaseMsg("✅ Order Placed Successfully! Go to Orders page to track status.");
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Purchase failed");
    }
  };

  const handleUpdateListing = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/listings/${id}`, {
        pricePerKg: newPrice,
        isActive: isListingActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Listing updated successfully!");
      setEditMode(false);
      fetchListing();
    } catch (err) {
      alert("Update failed: " + err.response?.data?.message);
    }
  };

  const startChat = async () => {
    if (showChat) {
      setShowChat(false);
      return;
    }
    setShowChat(true);

    // Initialize Real Chat
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/chats/init', {
        listingId: listing._id // Pre-sales chat context
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChatId(res.data.data._id);
      setMessages(res.data.data.messages);
    } catch (err) {
      console.error("Chat Init Failed", err);
    }
  };

  const fetchChatMessages = async () => {
    if (!chatId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/chats/${chatId}/message`, {
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMessage('');
      fetchChatMessages(); // Refresh UI
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;
  if (!listing) return <div className="container">Listing not found</div>;

  return (
    <div className="container listing-details-page">
      <button className="btn btn-blue back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="product-layout">
        <div className="product-image">
          {listing.batch?.imageUrl ? (
            <img
              src={listing.batch.imageUrl}
              alt={listing.batch.cropName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
            />
          ) : (
            <div className="img-placeholder">
              📦 {listing.batch?.cropName || 'Product'}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1>{listing.batch?.cropName || 'Farm Produce'}</h1>
          <p className="seller-tag">Sold by: <strong>{listing.seller.name}</strong></p>

          <div className="price-tag">
            ₹{listing.pricePerKg} <span className="per-unit">/ kg</span>
          </div>

          <div className="details-card">
            <h3>Product Details</h3>
            <ul>
              <li><strong>Available:</strong> {listing.quantityAvailable} kg</li>
              <li><strong>Location:</strong> {listing.seller.location || 'N/A'}</li>
            </ul>
          </div>

          {purchaseMsg && <div className="success-msg" style={{ color: 'green', marginBottom: '10px' }}>{purchaseMsg}</div>}

          {/* === SELLER MANAGEMENT PANEL === */}
          {currentUser && listing.seller._id === currentUser._id && (
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
              <h3 style={{ marginTop: 0, color: '#2c3e50' }}>⚙️ Manage Your Listing</h3>

              {!editMode ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className={`badge ${listing.isActive ? 'badge-approved' : 'badge-pending'}`}
                      style={{ background: listing.isActive ? '#27ae60' : '#e74c3c', color: 'white', padding: '5px 10px', borderRadius: '4px' }}>
                      {listing.isActive ? 'Active on Market' : 'Inactive (Hidden)'}
                    </span>
                  </div>
                  <button onClick={() => setEditMode(true)} className="btn btn-blue" style={{ fontSize: '0.9rem' }}>Edit Listing</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label>Updated Price (₹):</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label>Status:</label>
                    <select
                      value={isListingActive}
                      onChange={(e) => setIsListingActive(e.target.value === 'true')}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="true">Active (Visible)</option>
                      <option value="false">Inactive (Hidden)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={handleUpdateListing} className="btn btn-green">Save Changes</button>
                    <button onClick={() => setEditMode(false)} className="btn btn-blue" style={{ background: '#7f8c8d' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === BUYER / PUBLIC VIEW === */}
          {(!currentUser || listing.seller._id !== currentUser._id) && (
            <div className="action-buttons" style={{ flexDirection: 'column', gap: '10px' }}>
              {listing.isActive ? (
                <>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label>Qty (kg):</label>
                    <input
                      type="number"
                      value={buyQuantity}
                      onChange={(e) => setBuyQuantity(e.target.value)}
                      style={{ padding: '10px', width: '80px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                      Total: ₹{buyQuantity * listing.pricePerKg}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="btn btn-green buy-btn" onClick={handleBuy}>Buy Now</button>
                    <button className="btn btn-orange chat-btn" onClick={startChat}>
                      {showChat ? 'Close Chat' : '💬 Chat with Owner'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '20px', background: '#ffebee', color: '#c0392b', borderRadius: '5px', textAlign: 'center' }}>
                  ⚠️ This listing is currently inactive and cannot be purchased.
                </div>
              )}

              {showChat && (
                <div className="chat-section" style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                  <div className="chat-body" style={{ height: '200px', overflowY: 'auto', marginBottom: '10px', borderBottom: '1px solid #eee' }}>
                    {messages.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>Start asking about the product...</p>}
                    {messages.map((m, i) => (
                      <div key={i} className={`chat-message ${m.sender._id === currentUser._id || m.sender === currentUser._id ? 'my-message' : 'other-message'}`}>
                        <small className="sender-name">{m.sender.name || 'User'}</small>
                        <div className="message-content">{m.content}</div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="chat-input" style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      style={{ flex: 1, padding: '8px' }}
                    />
                    <button onClick={sendMessage} className="btn btn-blue" style={{ width: 'auto' }}>Send</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
