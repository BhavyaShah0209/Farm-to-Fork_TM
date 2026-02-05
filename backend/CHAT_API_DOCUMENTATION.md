# Chat System API Documentation

## Overview

The chat system allows buyers and sellers to communicate about orders. When an order is created, both parties can initiate a chat to discuss order details, negotiate, or resolve issues.

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

**Request:**

```
POST /api/chats/order/65f1234567890abcdef12345
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
        "mobile": "9876543210"
      }
    ],
    "messages": [],
    "isActive": true,
    "createdAt": "2026-02-05T10:30:00.000Z"
  }
}
```

---

### 2. Send a Message

**Endpoint:** `POST /api/chats/:chatId/message`  
**Access:** Private (Participants only)  
**Description:** Send a message in a chat

**Request:**

```
POST /api/chats/65f9876543210fedcba98765/message
Headers: {
  Authorization: Bearer <token>
}
Body: {
  "content": "Hello! Is the produce still available?"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "chat": {
      "_id": "65f9876543210fedcba98765",
      "messages": [
        {
          "_id": "65f3333333333333333333333",
          "sender": {
            "_id": "65f2222222222222222222222",
            "name": "Jane Distributor",
            "role": "distributor"
          },
          "content": "Hello! Is the produce still available?",
          "readBy": ["65f2222222222222222222222"],
          "timestamp": "2026-02-05T10:35:00.000Z"
        }
      ],
      "lastMessage": {
        "content": "Hello! Is the produce still available?",
        "sender": "65f2222222222222222222222",
        "timestamp": "2026-02-05T10:35:00.000Z"
      }
    },
    "message": {
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
```

---

### 3. Get All Chats for User

**Endpoint:** `GET /api/chats`  
**Access:** Private  
**Description:** Get all chats for the logged-in user

**Request:**

```
GET /api/chats
Headers: {
  Authorization: Bearer <token>
}
```

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
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
