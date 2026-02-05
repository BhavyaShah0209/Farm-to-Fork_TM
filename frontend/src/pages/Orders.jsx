import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ChatBox from '../components/ChatBox';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState({ purchases: [], sales: [] });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Chat State
  const [activeChatOrder, setActiveChatOrder] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders(); // Refresh
      alert(`Order ${newStatus} successfully!`);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update status`);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/orders/${orderId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Ownership Transferred! You can now sell this produce.");
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete order");
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '30px' }}>Loading Orders...</div>;

  return (
    <div className="container">
      {/* Chat Overlay */}
      {activeChatOrder && (
        <ChatBox
          orderId={activeChatOrder}
          currentUser={user}
          onClose={() => setActiveChatOrder(null)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>📦 My Orders & Sales</h2>
        <button className="btn btn-blue" style={{ width: 'auto' }} onClick={() => navigate('/')}>Back to Market</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>

        {/* PURCHASES SECTION */}
        <div className="order-section">
          <div style={{
            borderBottom: '2px solid var(--secondary)',
            paddingBottom: '15px',
            marginBottom: '20px',
            color: 'var(--secondary)',
            fontSize: '1.2rem',
            fontWeight: '500'
          }}>
            📤 My Purchases (Buying)
          </div>

          {orders.purchases.length === 0 ? <p style={{ color: '#999' }}>No purchases yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.purchases.map(o => (
                <div key={o._id} className="card" style={{ borderLeft: '5px solid var(--secondary)', margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ color: '#555' }}>Order #{o._id.substring(o._id.length - 6)}</strong>
                    <span className={`badge badge-${o.status}`}>{o.status}</span>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{o.listing?.batch?.cropName || 'Unknown Crop'}</h4>
                    <p style={{ margin: '0', color: '#777' }}>Qty: {o.quantityRequest} kg</p>
                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>₹{o.totalPrice}</p>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '15px' }}>
                    Seller: {o.seller?.name}
                  </div>

                  {o.status === 'approved' && (
                    <button
                      className="btn btn-orange"
                      onClick={() => handleCompleteOrder(o._id)}
                    >
                      💰 Pay & Transfer Ownership
                    </button>
                  )}
                  {o.status === 'transferred' && (
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '10px', fontWeight: '500' }}>✅ Owned by You</span>
                      {o.listing?.batch?.batchId && (
                        <a href={`/traceability?id=${o.listing.batch.batchId}`} className="btn btn-purple" style={{ fontSize: '0.8rem', padding: '5px 10px', width: 'auto', display: 'inline-block' }}>
                          🔍 Trace
                        </a>
                      )}
                    </div>
                  )}

                  {/* Chat Button for Buyer */}
                  <button
                    className="btn"
                    style={{ marginTop: '10px', background: '#e0f7fa', color: '#006064' }}
                    onClick={() => setActiveChatOrder(o._id)}
                  >
                    💬 Chat with Seller
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SALES SECTION */}
        <div className="order-section">
          <div style={{
            borderBottom: '2px solid var(--primary)',
            paddingBottom: '15px',
            marginBottom: '20px',
            color: 'var(--primary)',
            fontSize: '1.2rem',
            fontWeight: '500'
          }}>
            📥 Incoming Orders (Selling)
          </div>

          {orders.sales.length === 0 ? <p style={{ color: '#999' }}>No incoming orders yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.sales.map(o => (
                <div key={o._id} className="card" style={{ borderLeft: '5px solid var(--primary)', margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ color: '#555' }}>Order #{o._id.substring(o._id.length - 6)}</strong>
                    <span className={`badge badge-${o.status}`}>{o.status}</span>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{o.listing?.batch?.cropName}</h4>
                    <p style={{ margin: '0', color: '#777' }}>Request: {o.quantityRequest} kg</p>
                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>Total: ₹{o.totalPrice}</p>
                  </div>

                  <p style={{ marginBottom: '15px', fontSize: '0.9rem' }}><strong>Buyer:</strong> {o.buyer?.name}</p>

                  {o.status === 'pending' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                      <button className="btn btn-green" onClick={() => handleStatusUpdate(o._id, 'approved')}>✅ Approve</button>
                      <button className="btn btn-orange" style={{ backgroundColor: '#ff6b6b' }} onClick={() => handleStatusUpdate(o._id, 'rejected')}>❌ Reject</button>
                    </div>
                  )}
                  {o.status === 'approved' && <p style={{ color: '#e67e22', marginTop: '5px', fontWeight: '500' }}>⏳ Waiting Payment</p>}
                  {o.status === 'transferred' && <p style={{ color: 'var(--primary)', marginTop: '5px', fontWeight: '500' }}>✅ Transferred</p>}

                  {/* Chat Button for Seller */}
                  <button
                    className="btn"
                    style={{ marginTop: '10px', background: '#e0f7fa', color: '#006064' }}
                    onClick={() => setActiveChatOrder(o._id)}
                  >
                    💬 Chat with Buyer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
