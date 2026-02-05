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
          <div className="img-placeholder">
            📦 {listing.batch?.cropName || 'Product'}
          </div>
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

          <div className="action-buttons" style={{ flexDirection: 'column', gap: '10px' }}>
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
        </div>
      </div>
    </div>
  );
}
