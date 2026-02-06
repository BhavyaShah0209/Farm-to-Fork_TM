const express = require('express');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');
const { initBlockchain } = require('./utils/blockchain');

// Connect to database
const startServer = async () => {
  try {
    await connectDB();

    // Initialize Blockchain Connection (Non-blocking)
    initBlockchain();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(cors()); // Enable CORS

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/traceability', require('./routes/traceabilityRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
// app.use('/api/blockchain', require('./routes/blockchainRoutes'));

startServer();
