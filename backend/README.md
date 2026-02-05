# AgriTech Backend

This is the backend server for the TedheMedhes AgriTech platform. It handles user authentication, product listings, order management, payment processing via Razorpay, and traceability. The backend uses Node.js, Express, and MongoDB.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Listings](#listings)
  - [Orders](#orders)
  - [Payments](#payments)
  - [Traceability](#traceability)
- [Data Models](#data-models)

## Prerequisites
- **Node.js**: v14+ recommended
- **MongoDB**: Local instance or MongoDB Atlas connection string.
- **npm**: Comes with Node.js

## Installation & Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *Core dependencies:* `express`, `mongoose`, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`, `ethers`, `razorpay`.

3.  **Configure Environment Variables:**
    Create a `.env` file in the `backend/` root (see [.env.example](#environment-variables)).

4.  **Run the server:**
    ```bash
    # Standard start
    npm start

    # Dev mode (with nodemon)
    npm run dev  # (If script exists, otherwise use 'npx nodemon server.js')
    ```
    Server runs on `http://localhost:5000` by default.

## Environment Variables
Create a `.env` file with the following keys:

```ini
PORT=5000
MONGO_URI=mongodb://localhost:27017/agritech  # Or your Atlas URI
JWT_SECRET=your_super_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
# Any blockchain related env vars if needed
```

## API Documentation

**Base URL:** `http://localhost:5000/api`

### Authentication
End points for user management.

| Method | Endpoint | Description | Auth | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user | Public | `{ "name": "John", "email": "j@test.com", "password": "123", "role": "farmer", "mobile": "9999999999" }` <br> Role: `farmer`, `distributor`, `retailer` |
| `POST` | `/auth/login` | Login user | Public | `{ "email": "j@test.com", "password": "123" }` |
| `GET` | `/auth/profile` | Get current user info | **Private** | *None* |

### Listings
Marketplace operations. Farmers create initial batches; these become listings.

| Method | Endpoint | Description | Auth | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/listings/create` | Create a new Batch & Listing (Farmer Only) | **Private** | `{ "cropName": "Wheat", "quantity": 100, "pricePerKg": 50, "harvestDate": "2023-10-01", "originLocation": "Punjab" }` |
| `GET` | `/listings` | Get all available listings | **Private** | *None* |
| `GET` | `/listings/:id` | Get details of a single listing | **Private** | `id` (Listing ID) in URL |
| `PUT` | `/listings/:id` | Update listing details | **Private** | Updates to price/quantity |

### Orders
Buying and selling process management.

| Method | Endpoint | Description | Auth | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/orders/create` | Place a buy order | **Private** | `{ "listingId": "mongo_id", "quantity": 10 }` |
| `GET` | `/orders` | Get user's orders (Buy & Sell) | **Private** | *None* |
| `PUT` | `/orders/:id/status` | Update order status | **Private** | `{ "status": "approved" }` (or paid, etc.) |
| `POST` | `/orders/:id/complete` | Finalize order & Transfer Ownership | **Private** | *None* |

### Payments
Integration with Razorpay.

| Method | Endpoint | Description | Auth | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/payments/create-order` | Init Razorpay order | **Private** | `{ "orderId": "mongo_order_id" }` (Internal logic calculates amount) |
| `POST` | `/payments/verify` | Verify payment success | **Private** | Razorpay response signature |

### Traceability
Track product journey via Blockchain/Batch ID.

| Method | Endpoint | Description | Auth | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/traceability/:batchId` | Get full journey of a batch | Public | `batchId` (String) in URL |

## Data Models

1.  **User**: Stores profile, role (farmer/distributor/etc), and wallet info.
2.  **Batch**: The immutable "Source of Truth" for a crop harvest. Contains `journey` array tracking all hands it passed through.
3.  **Listing**: Represents a specific "for sale" item. Links to a `Batch` and a `Seller`. Parent listings allow tracking split quantities.
4.  **Order**: Tracks a transaction between Buyer and Seller. Links a `Listing` to a `Buyer`.
