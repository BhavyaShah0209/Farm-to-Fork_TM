import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatBox.css';

export default function ChatBox({ orderId, onClose, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChat();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChat = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use new flexible init endpoint
      const res = await axios.post(`/api/chats/init`, {
        orderId: orderId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChatId(res.data.data._id);
      setMessages(res.data.data.messages);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load chat", err);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/chats/${chatId}/message`, {
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMessage('');
      fetchChat(); // Refresh immediately
    } catch (err) {
      console.error("Failed to send", err);
      alert("Failed to send message");
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-box-container">
        <div className="chat-header">
          <h3>💬 Order Chat</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="chat-messages">
          {loading ? <p>Loading chat...</p> : (
            messages.length === 0 ? <p className="no-msg">Start the conversation!</p> : (
              messages.map((m, i) => (
                <div key={i} className={`message-row ${m.sender._id === currentUser._id || m.sender === currentUser._id ? 'mine' : 'theirs'}`}>
                  <div className="message-bubble">
                    <div className="msg-sender">{m.sender.name || 'User'}</div>
                    <div className="msg-text">{m.content}</div>
                    <div className="msg-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
