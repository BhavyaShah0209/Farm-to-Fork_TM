import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import './Traceability.css';

export default function Traceability() {
  const [searchParams] = useSearchParams();
  const [batchId, setBatchId] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setBatchId(idFromUrl);
      fetchTraceability(idFromUrl);
    }
  }, [searchParams]);

  const fetchTraceability = async (idToFetch) => {
    const id = idToFetch || batchId;
    if (!id) {
      setError("Please enter a Batch ID");
      return;
    }

    setLoading(true);
    setError('');
    setBatchData(null);

    try {
      const res = await axios.get(`/api/traceability/${id}`);
      // Adapt to new backend structure { dbData, blockchainData } or old { ...dbData }
      if (res.data.dbData || res.data.blockchainData) {
        setBatchData(res.data);
      } else {
        // Fallback if structure didn't change (legacy)
        setBatchData({ dbData: res.data });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Traceability data not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTraceability();
  };

  return (
    <div className="container traceability-container">
      <h1 className="title">🔍 Trace Your Food</h1>

      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          placeholder="Enter Batch ID (e.g. BATCH_171...)"
          className="search-input"
        />
        <button type="submit" className="btn btn-green search-btn">Trace</button>
      </form>

      {loading && <p className="loading-text">Tracking farm-to-fork journey...</p>}

      {error && <p className="error-text">{error}</p>}

      {batchData && batchData.dbData && (
        <div className="result-area">
          <div className="product-header">
            <h2 className="product-title">{batchData.dbData.cropName}</h2>
            <div className="product-meta">
              <p>🌱 <strong>Origin:</strong> {batchData.dbData.originLocation}</p>
              <p>🚜 <strong>Harvested:</strong> {new Date(batchData.dbData.harvestDate).toLocaleDateString()}</p>
              <p>🔢 <strong>Current Qty:</strong> {batchData.dbData.quantityInitial} kg</p>
            </div>
          </div>

          <div className="timeline">
            {batchData.dbData.journey.map((event, index) => (
              <div key={index} className="event">
                <div className="event-card">
                  <span className={`role-tag role-${event.role}`}>{event.role}</span>
                  <span className="date">{new Date(event.date).toLocaleString()}</span>

                  <div className="event-action">{event.action}</div>

                  <div className="event-details">
                    By: {event.handler ? event.handler.name : 'Unknown Handler'} ({event.handler?.email || 'N/A'})
                  </div>

                  {event.transactionHash && (
                    <div className="tx-hash">
                      ⛓ Blockchain TX: <a href={`https://dashboard.tenderly.co/tx/${event.transactionHash}`} target="_blank" rel="noopener noreferrer" title={event.transactionHash}>{event.transactionHash.substring(0, 15)}...</a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {batchData.blockchainData && (
            <div className="blockchain-verification">
              <h3>⛓ On-Chain Verification</h3>
              <div className="code-block">
                <p><strong>Status:</strong> {['CREATED', 'SPLIT', 'TRANSFERRED', 'SOLD'][batchData.blockchainData.status]}</p>
                <p><strong>Holder:</strong> {batchData.blockchainData.holderId}</p>
                <p><strong>Events:</strong> {batchData.blockchainData.history.length}</p>
                <pre>{JSON.stringify(batchData.blockchainData, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="qr-section">
            <p>Scan to verify authenticity on mobile</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/traceability?id=' + batchId)}`}
              alt="QR Code"
              className="qr-code"
            />
          </div>
        </div>
      )}
    </div>
  );
}
