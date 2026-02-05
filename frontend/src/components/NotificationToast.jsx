import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationToast.css';

export default function NotificationToast() {
  const [notification, setNotification] = useState(null);
  const [lastUnreadCount, setLastUnreadCount] = useState(0);

  useEffect(() => {
    const checkUnread = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('/api/chats/unread/count', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const currentUnread = res.data.data.totalUnread;

        if (currentUnread > lastUnreadCount) {
          const diff = currentUnread - lastUnreadCount;
          setNotification(`You have ${diff} new message${diff > 1 ? 's' : ''}!`);
          setTimeout(() => setNotification(null), 5000); // Hide after 5 sec
        }

        setLastUnreadCount(currentUnread);

      } catch (err) {
        // Silent fail
      }
    };

    // Poll every 5 seconds
    const interval = setInterval(checkUnread, 5000);
    checkUnread(); // Initial check

    return () => clearInterval(interval);
  }, [lastUnreadCount]);

  if (!notification) return null;

  return (
    <div className="notification-toast">
      <div className="toast-icon">💬</div>
      <div className="toast-content">
        <div className="toast-title">New Message</div>
        <div className="toast-body">{notification}</div>
      </div>
      <button className="toast-close" onClick={() => setNotification(null)}>×</button>
    </div>
  );
}
