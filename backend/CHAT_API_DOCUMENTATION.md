# Chat System API Documentation

## 📖 For Frontend Developers

This document explains how to integrate the chat functionality into your frontend application. Each endpoint is explained with:

- **When to use it** (frontend use case)
- **What to send** (request format)
- **What you get back** (response format)
- **How to handle errors** (error cases)
- **Example code** (JavaScript/fetch examples)

---

## Overview

The chat system allows buyers and sellers to communicate about orders. When an order is created, both parties can initiate a chat to discuss order details, negotiate, or resolve issues.

### Key Concepts for Frontend

1. **Authentication Required**: All API calls need `Authorization: Bearer <token>` header
2. **Order-Based Chats**: Each chat is linked to a specific order
3. **Automatic Read Receipts**: Messages are marked as read when user views the chat
4. **Polling or WebSockets**: Currently requires polling - check for new messages periodically

---

## Features

- 🗨️ Real-time messaging between buyer and seller
- 📬 Unread message tracking
- 🔔 Message read receipts
- 📋 Chat history linked to specific orders
- 🔒 Privacy - only order participants can access the chat

## API Endpoints

### 1. Create or Get Chat for an Order

**Endpoint:** `POST /api/chats/order/:orderId`  
**Access:** Private (Buyer or Seller of the order)  
**Description:** Creates a new chat for an order or retrieves existing chat

**🎯 When to Use (Frontend):**

- When user clicks "Message Seller" or "Message Buyer" button on an order
- On order details page to initialize chat
- First call before showing chat interface

**📤 What to Send:**

````javascript
// JavaScript fetch example
co📥 What You Get Back (Success):**

```json
{
  "success": true,
  "data": {
    "_id": "65f9876543210fedcba98765",  // ⚠️ IMPORTANT: Save this chatId
    "order": "65f1234567890abcdef12345",
    "participants": [  // Array of users in chat (buyer + seller)
      {
        "_id": "65f1111111111111111111111",
        "name": "John Farmer",
        "role": "farmer",
        "email": "john@example.com"
      },
      {
        "_id": "65f2222222222222222222222",
        "name": "Jane Distributor",
        "role": "distributor",
        "mobile": "9876543210"
      }
    ],
    "messages": [],  // Empty if new chat, populated if existing
    "isActive": true,
    "createdAt": "2026-02-05T10:30:00.000Z"
  }
}
````

**❌ Error Cases:**

```json
// Order not found
{ "message": "Order not found" }  // Status: 404

// Not authorized (user not buyer/seller)
{ "message": "Not authorized to access this chat" }  // Status: 403

// Invalid/expired token
{ "message": "Not authorized, token failed" }  // Status: 401
```

**💡 Frontend Tips:**

- Store the `chatId` in component state or context
- Display participant names in chat header
- If `messages` is empty, show "Start conversation" message

**Response:**

````json
{
  "success": true,
  "data": {
    "_id": "65f9876543210fedcba98765",
    "order": "65f1234567890abcdef12345",
    "participants": [
      {
        "_id": "65f1111111111111111111111",
        "name": "John Farmer",
        "role": "farmer",
        "email": "john@example.com"
      },
      {
        "_id": "65f2222222222222222222222",
        "name": "Jane Distributor",
        "role": "distributor",
  🎯 When to Use (Frontend):**
- When user types and sends a message
- On form submit in chat input field

**📤 What to Send:**

```javascript
// JavaScript fetch example
const chatId = "65f9876543210fedcba98765"; // From step 1
const messageContent = "Hello! Is the produce still available?";
const token = localStorage.getItem('authToken');

fe📥 What You Get Back (Success):**

```json
{
  "success": true,
  "data": {
    "chat": {  // Full updated chat object
      "_id": "65f9876543210fedcba98765",
      "messages": [  // All messages including the new one
        {
          "_id": "65f3333333333333333333333",
          "sender": {
            "_id": "65f2222222222222222222222",
            "name": "Jane Distributor",
            "role": "distributor"
          },
          "content": "Hello! Is the produce still available?",
          "readBy": ["65f2222222222222222222222"],  // Only sender has read it
          "timestamp": "2026-02-05T10:35:00.000Z"
        }
      ],
      "lastMessage": {
        "content": "Hello! Is the produce still available?",
        "sender": "65f2222222222222222222222",
        "timestamp": "2026-02-05T10:35:00.000Z"
      }
    },
    "message": {  // ⚠️ The specific message just sent (use this for UI)
      "_id": "65f3333333333333333333333",
      "sender": {
        "_id": "65f2222222222222222222222",
        "name": "Jane Distributor",
        "role": "distributor"
      },
      "content": "Hello! Is the produce still available?",
      "timestamp": "2026-02-05T10:35:00.000Z"
    }
  }
}
````

**❌ Error Cases:**

```json
// Empty message
{ "message": "Message content is required" }  // Status: 400

// Chat not found
{ "message": "Chat not found" }  // Status: 404

// Not a participant
{ "message": "Not authorized to send messages in this chat" }  // Status: 403
```

**💡 Frontend Tips:**

- Disable send button while message is empty
- Trim whitespace before sending
- Show loading state while sending
- Use `data.message` object to immediately add to UI (optimistic update)escription:\*\* Send a message in a chat

**Request:**

````
POST /api/chats/65f9876543210fedcba98765/message
Headers: {
  Authorization: Bearer <token>
}
Bo🎯 When to Use (Frontend):**
- On "Messages" or "Chats" page load
- To display list of all conversations
- To show inbox/chat list sidebar

**📤 What to Send:**

```javascript
// JavaScript fetch example
co📥 What You Get Back (Success):**

```json
{
  "success": true,
  "count": 2,  // Total number of chats
  "data": [  // Array of chat objects
    {
      "_id": "65f9876543210fedcba98765",
      "order": {  // Related order info
        "_id": "65f1234567890abcdef12345",
        "status": "approved",
        "totalPrice": 5000
      },
      "participants": [  // Array of users
        {
          "_id": "65f1111111111111111111111",
          "name": "John Farmer",
          "role": "farmer"
        },
        {
          "_id": "65f2222222222222222222222",
          "name": "Jane Distributor",
          "role": "distributor"
        }
      ],
      "lastMessage": {  // ⚠️ Use for preview in chat list
        "content": "Yes, it's available!",
        "sender": {
          "name": "John Farmer"
        },
        "timestamp": "2026-02-05T10:40:00.000Z"
      },
      "unreadCount": 2,  // Number of unread messages for this user
      "isActive": true
    }
  🎯 When to Use (Frontend):**
- When user opens a specific chat
- To load chat history
- To refresh chat periodically (polling every 3-5 seconds)
- **Important:** Automatically marks messages as read for current user

**📤 What to Send:**

```javascript
// JavaScript fetch example
const chatId = "65f9876543210fedcba98765";
const token = localStorage.getItem('authToken');

fetch(`http://localhost:5000/api/chats/${chatId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    const messages = data.data.messages;
    // Render all messages
    // Scroll to bottom
    // Mark as read automatically happens on server
  }
})
.catch(err => console.error('Error fetching chat:', err));

// For polling (check for new messages every 5 seconds)
setInterval(() => {
  // Call above fetch function
}, 5000);
````

\*\*Raw ]
}

````

**💡 Frontend Tips:**
- Sort by `lastMessage.timestamp` (most recent first)
- Show `unreadCount` badge on each chat item
- Display `lastMessage.content` as preview text
- 📥 What You Get Back (Success):**

```json
{
  "success": true,
  "data": {
    "_id": "65f9876543210fedcba98765",
    "order": {
      "_id": "65f1234567890abcdef12345",
      "status": "approved",
      "totalPrice": 5000
    },
    "participants": [
      {
        "_id": "65f1111111111111111111111",
        "name": "John Farmer",
        "role": "farmer"
      },
      {
        "_id": "65f2222222222222222222222",
        "name": "Jane Distributor",
        "role": "distributor"
      }
    ],
    "messages": [  // ⚠️ Array of ALL messages (chronological order)
      {
        "_id": "65f3333333333333333333333",
        "sender": {
          "_id": "65f2222222222222222222222",
          "name": "Jane Distributor",
          "role": "distributor"
        },
        "content": "Hello! Is the produce still available?",
        "readBy": ["65f2222222222222222222222", "65f1111111111111111111111"],
        "timestamp": "2026-02-05T10:35:00.000Z"
      },
      {
        "_id": "65f4444444444444444444444",
        "sender": {
          "_id": "65f1111111111111111111111",
          "name": "John Farmer",
          "role": "farmer"
        },
        "content": "Yes, it's available!",
        "readBy": ["65f1111111111111111111111", "65f2222222222222222222222"],
        "timestamp": "2026-02-05T10:40:00.000Z"
      }
    ],
    "isActive": true
  }
}
````

**❌ Error Cases:**

````json
// Chat not found
{ 🎯 When to Use (Frontend):**
- On app initialization to show notification badge
- Poll periodically to update unread count (every 10-30 seconds)
- After user navigates away from chat page

**📤 What to Send:**

```javascript
// JavaScript fetch example
co📥 What You Get Back (Success):**

```json
{
  "success": true,
  "data": {
    "totalUnread": 5,  // ⚠️ Total unread messages across all chats
    "unreadByChat": {  // Breakdown by chat ID
      "65f9876543210fedcba98765": 3,  // 3 unread in this chat
      "65faaaaaaaaaaaaaaaaaaaaa": 2   // 2 unread in this chat
    }
  }
}
````

**💡 Frontend Tips:**

- Display `totalUnread` in navigation badge (e.g., "Messages (5)")
- Use `unreadByChat` to show count per chat in list view
- Poll this endpoint less frequently than chat messages (e.g., every 30 seconds)
- Hide badge when `totalUnread === 0 // Show red dot on messages icon
  }
  })
  .catch(err => console.error('Error fetching unread count:', err));

```

**Raw "message": "Chat not found" }  // Status: 404

// Not authorized (not a participant)
{ "message": "Not authorized to access this chat" }  // Status: 403
```

**💡 Frontend Tips:**

- Display messages in chat bubbles (right side for current user, left for other)
- Check `sender._id` against current user ID to determine message alignment
- Format `timestamp` to relative time ("2 mins ago", "Yesterday", etc.)
- Use `readBy` array to show read receipts (seen by both users)
- Call this endpoint periodically to get new messages (polling) "\_id": "65f3333333333333333333333",
  "sender": {
  "\_id": "65f2222222222222222222222",
  "name": "Jane Distributor",
  "role": "distributor"
  },
  "content": "Hello! Is the produce still available?",
  "timestamp": "2026-02-05T10:35:00.000Z"
  }
  }
  }

````

---

### 3. Get All Chats for User
🎯 When to Use (Frontend):**
- When user clicks "Delete Chat" or "Close Conversation"
- Archive completed order chats
- Note: This is a soft delete - chat history is preserved

**📤 What to Send:**

```javascript
// JavaScript fetch example
const chatId = "65f9876543210fedcba98765";
const token = localStorage.getItem('authToken');

if (confirm('Are you sure you want to close this chat?')) {
  fetch(`http://localhost:5000/api/chats/${chatId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => res.json())
---

## 🔄 Complete Frontend Integration Flow

### Step-by-Step Implementation Guide

#### 1. User Creates/Views an Order

```javascript
// After order is created or when viewing order details
const orderId = order._id;

// Show "Message Seller" button
<button onClick={() => initiateChat(orderId)}>
  💬 Message Seller
</button>
````

#### 2. Initialize Chat

````javascript
async function initiateChat(orderId) {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`http://localhost:5000/api/chats/order/${orderId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (data.success) {
      const chatId = data.data._id;
      const messages = data.data.messages;
      const otherParticipant = data.data.participants.find(
        p => p._id !== currentUserId
      );

      // Navigate to chat page or open chat modal
      openChatWindow(chatId, otherParticipant, messages);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to open chat');
  }
---

## 🎨 UI/UX Recommendations

### Chat List Page
- Display chats sorted by most recent message
- Show unread count badge on each chat
- Preview last message (truncate to ~50 chars)
- Show participant avatar/name
- Indicate online status (if available)

### Chat Interface
- Fixed header with participant name and order details
- Scrollable message area (auto-scroll to bottom on new message)
- Fixed input field at bottom
- "Typing..." indicator (future enhancement)
- Read receipts (✓ sent, ✓✓ read)
- Timestamp formatting (relative time)

### Notifications
- Badge on navigation showing total unread count
- Browser notification for new messages (future)
- Sound on message received (optional)

---

## ⚠️ Important Notes for Frontend

---

## 🧪 Testing Guide

### Using Postman/Thunder Client

1. **Set up Environment Variables:**
   - `BASE_URL`: `http://localhost:5000`
   - `FARMER_TOKEN`: Token from farmer login
   - `BUYER_TOKEN`: Token from buyer login
   - `ORDER_ID`: ID from created order
   - `CHAT_ID`: ID from created chat

2. **Test Flow:**
   1. Register users → Login → Save tokens
   2. Create listing (as farmer)
   3. Create order (as buyer) → Save order ID
   4. Create chat with order ID → Save chat ID
   5. Send messages back and forth
   6. Check unread count
   7. Get chat list

### Quick cURL Examples

```bash
# 1. Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "password": "password123"}'

# 2. Create/Get Chat
curl -X POST http://localhost:5000/api/chats/order/ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Send Message
curl -X POST http://localhost:5000/api/chats/CHAT_ID/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
---

## 📊 Data Models Reference

### Chat Object Structure

```javascript
{
  _id: String,                    // Chat ID
  order: ObjectId,                // Related order ID
  participants: [                 // Array of users
    {
      _id: String,
      name: String,
      email: String,
      mobile: String,
      role: String                // "farmer", "distributor", etc.
    }
  ],
  messages: [                     // Array of messages
    {
      _id: String,                // Message ID
      sender: {
        _id: String,
        name: String,
        role: String
      },
      content: String,            // Message text
      readBy: [String],           // Array of user IDs who read this
      timestamp: Date             // ISO 8601 format
    }
  ],
  lastMessage: {                  // Latest message preview
    content: String,
    sender: ObjectId,
    timestamp: Date
---

## ❓ FAQ for Frontend Developers

**Q: How do I know when to show the "Message Seller" button?**
A: Show it on any order details page. The chat will be created automatically when user clicks it.

**Q: How often should I poll for new messages?**
A: When chat is open: every 3-5 seconds. For unread count: every 30 seconds. Stop polling when user leaves the page.

**Q: How do I show read receipts?**
A: Check `message.readBy` array. If it includes both participant IDs, show double checkmark (✓✓).

**Q: What if the order doesn't exist when creating chat?**
A: You'll get a 404 error. Always ensure order exists before showing chat option.

**Q: Can users chat before order is approved?**
A: Yes! Chat is available as soon as order is created, regardless of approval status.

**Q: How do I handle deleted/closed chats?**
A: Chats with `isActive: false` won't appear in the list. Deletion is soft, so history is preserved.

**Q: What's the character limit for messages?**
A: No hard limit currently, but recommend frontend validation at 1000 characters for good UX.

**Q: Do I need to manually mark messages as read?**
A: No! Messages are automatically marked as read when you call `GET /api/chats/:chatId`.

**Q: What if user loses internet connection?**
A: Store unsent messages locally and retry sending when connection is restored.

**Q: Can I implement infinite scroll for old messages?**
A: Currently, all messages are returned. For pagination, you'll need backend updates (future enhancement).

---

## 🚀 Future Enhancements (Roadmap)

### Coming Soon
- 🚀 **WebSocket support** for real-time messaging (no polling needed)
- 📎 **File/image attachments** (photos of produce, invoices)
- 👀 **Typing indicators** ("John is typing...")
- ✏️ **Edit messages** (within 5 minutes of sending)
- ❌ **Delete messages** (soft delete with "Message deleted" placeholder)

### Planned Features
- 🔍 **Message search** functionality across all chats
- 📧 **Push notifications** (browser and mobile)
- 🌍 **Timezone support** for timestamps
- 🚫 **Report/block** inappropriate messages
- 📌 **Pin important messages**
- 💾 **Export chat history** (PDF/CSV)
- 🎤 **Voice messages**
- 📍 **Location sharing**

---

## 📞 Support

If you have questions about API integration:
- Check the **test-api.http** file for working examples
- Review the **Quick Start** section above
- Test endpoints with Postman/Thunder Client first
- Check browser console for error messages

---

## 🎯 Quick Reference

| Action | Endpoint | Method | When to Use |
|--------|----------|--------|-------------|
| Create/Get Chat | `/api/chats/order/:orderId` | POST | User clicks "Message" button |
| Send Message | `/api/chats/:chatId/message` | POST | User sends message |
| Get All Chats | `/api/chats` | GET | Load messages/inbox page |
| Get Specific Chat | `/api/chats/:chatId` | GET | Open chat, poll for new messages |
| Unread Count | `/api/chats/unread/count` | GET | Show notification badge |
| Close Chat | `/api/chats/:chatId` | DELETE | User deletes conversation |

---

**Last Updated:** February 5, 2026
**API Version:** 1.0
**Backend:** Node.js + Express + MongoDB
}
````

#### 4. Send Message

```javascript
async function sendMessage(chatId, content) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(
      `http://localhost:5000/api/chats/${chatId}/message`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      },
    );

    const data = await response.json();

    if (data.success) {
      const newMessage = data.data.message;
      // Add message to UI immediately
      appendMessageToChat(newMessage);
      // Clear input field
      document.getElementById("message-input").value = "";
      // Scroll to bottom
      scrollToBottom();
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to send message");
  }
}
```

#### 5. Poll for New Messages

```javascript
let pollingInterval;

function startPolling(chatId) {
  // Poll every 3 seconds when chat is open
  pollingInterval = setInterval(async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `http://localhost:5000/api/chats/${chatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();

      if (data.success) {
        updateChatMessages(data.data.messages);
      }
    } catch (error) {
      console.error("Polling error:", error);
    }
  }, 3000);
}

function stopPolling() {
  clearInterval(pollingInterval);
}

// Call when user opens chat
startPolling(chatId);

// Call when user closes chat or navigates away
stopPolling();
```

#### 6. Show Unread Count Badge

```javascript
async function updateUnreadBadge() {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(
      "http://localhost:5000/api/chats/unread/count",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const data = await response.json();

    if (data.success) {
      const badge = document.getElementById("unread-badge");
      const count = data.data.totalUnread;

      if (count > 0) {
        badge.textContent = count;
        badge.style.display = "block";
      } else {
        badge.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Poll every 30 seconds for unread count
setInterval(updateUnreadBadge, 30000);
```

#### 7. Display Chat List

```javascript
async function loadChatList() {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch('http://localhost:5000/api/chats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (data.success) {
      const chats = data.data;

      // Sort by most recent
      chats.sort((a, b) =>
        new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
      );

      renderChatList(chats);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function renderChatList(chats) {
  return chats.map(chat => {
    const otherUser = chat.participants.find(p => p._id !== currentUserId);
    const hasUnread = chat.unreadCount > 0;

    return `
      <div class="chat-item ${hasUnread ? 'unread' : ''}" onclick="openChat('${chat._id}')">
        <div class="chat-avatar">${otherUser.name[0]}</div>
        <div class="chat-info">
          <div class="chat-name">${otherUser.name}</div>
          <div class="chat-preview">${chat.lastMessage.content}</div>
        </div>
        <div class="chat-meta">
          <div class="chat-time">${formatTime(chat.lastMessage.timestamp)}</div>
          ${hasUnread ? `<div class="unread-count">${chat.unreadCount}</div>` : ''}
        </div>
      </div>
    `;
  });
}
    {
      "_id": "65f9876543210fedcba98765",
      "order": {
        "_id": "65f1234567890abcdef12345",
        "status": "approved",
        "totalPrice": 5000
      },
      "participants": [...],
      "lastMessage": {
        "content": "Yes, it's available!",
        "sender": {
          "name": "John Farmer"
        },
        "timestamp": "2026-02-05T10:40:00.000Z"
      },
      "isActive": true
    }
  ]
}
```

---

### 4. Get Specific Chat

**Endpoint:** `GET /api/chats/:chatId`  
**Access:** Private (Participants only)  
**Description:** Get a specific chat with all messages (marks messages as read)

**Request:**

```
GET /api/chats/65f9876543210fedcba98765
Headers: {
  Authorization: Bearer <token>
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "65f9876543210fedcba98765",
    "order": {...},
    "participants": [...],
    "messages": [
      {
        "_id": "65f3333333333333333333333",
        "sender": {...},
        "content": "Hello! Is the produce still available?",
        "readBy": ["65f2222222222222222222222", "65f1111111111111111111111"],
        "timestamp": "2026-02-05T10:35:00.000Z"
      },
      {
        "_id": "65f4444444444444444444444",
        "sender": {...},
        "content": "Yes, it's available!",
        "readBy": ["65f1111111111111111111111", "65f2222222222222222222222"],
        "timestamp": "2026-02-05T10:40:00.000Z"
      }
    ],
    "isActive": true
  }
}
```

---

### 5. Get Unread Message Count

**Endpoint:** `GET /api/chats/unread/count`  
**Access:** Private  
**Description:** Get count of unread messages

**Request:**

```
GET /api/chats/unread/count
Headers: {
  Authorization: Bearer <token>
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUnread": 5,
    "unreadByChat": {
      "65f9876543210fedcba98765": 3,
      "65faaaaaaaaaaaaaaaaaaaaa": 2
    }
  }
}
```

---

### 6. Close/Delete Chat

**Endpoint:** `DELETE /api/chats/:chatId`  
**Access:** Private (Participants only)  
**Description:** Soft delete/close a chat (marks as inactive)

**Request:**

```
DELETE /api/chats/65f9876543210fedcba98765
Headers: {
  Authorization: Bearer <token>
}
```

**Response:**

```json
{
  "success": true,
  "message": "Chat closed successfully"
}
```

---

## Usage Flow

### Step 1: Create an Order

When a buyer creates an order, they receive a response with `chatAvailable: true`:

```
POST /api/orders/create
Body: { "listingId": "...", "quantity": 50 }

Response: {
  "message": "Order created, waiting for approval. You can now chat with the seller.",
  "order": {...},
  "chatAvailable": true
}
```

### Step 2: Initiate Chat

Use the order ID to create/get a chat:

```
POST /api/chats/order/<orderId>
```

### Step 3: Send Messages

```
POST /api/chats/<chatId>/message
Body: { "content": "Your message here" }
```

### Step 4: Check for New Messages

```
GET /api/chats/unread/count
```

### Step 5: View Chat

```
GET /api/chats/<chatId>
```

---

## Security

- ✅ All endpoints require authentication
- ✅ Only order participants (buyer & seller) can access the chat
- ✅ Message validation prevents empty messages
- ✅ Soft delete preserves chat history

---

## Testing with Postman/cURL

### Example: Create Order and Start Chat

1. **Create Order:**

```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"listingId": "ORDER_ID", "quantity": 50}'
```

2. **Create Chat:**

```bash
curl -X POST http://localhost:5000/api/chats/order/ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Send Message:**

```bash
curl -X POST http://localhost:5000/api/chats/CHAT_ID/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, I would like to discuss the order details."}'
```

4. **Get All Chats:**

```bash
curl -X GET http://localhost:5000/api/chats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Schema

### Chat Model

```javascript
{
  order: ObjectId (ref: Order),
  participants: [ObjectId (ref: User)],
  messages: [{
    sender: ObjectId (ref: User),
    content: String,
    readBy: [ObjectId (ref: User)],
    timestamp: Date
  }],
  lastMessage: {
    content: String,
    sender: ObjectId (ref: User),
    timestamp: Date
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model (Updated)

```javascript
{
  // ... existing fields
  chatEnabled: Boolean (default: true)
}
```

---

## Future Enhancements (Not Implemented Yet)

- 🚀 WebSocket support for real-time messaging
- 📎 File/image attachment support
- 🔍 Message search functionality
- 🚫 Report/block inappropriate messages
- 📧 Email/SMS notifications for new messages
- ⏰ Message timestamps with timezone support
- ✏️ Edit/delete messages
- 👀 Typing indicators

---

## Notes

- Messages are stored in MongoDB with the chat document
- Read receipts are automatically updated when a user views a chat
- Chats are automatically created when accessing `/api/chats/order/:orderId`
- All timestamps are in UTC format
- Chat history is preserved even after order completion
