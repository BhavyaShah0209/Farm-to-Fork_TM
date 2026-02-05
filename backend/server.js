const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { initBlockchain } = require('./utils/blockchain');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();
// Initialize Blockchain Connection
initBlockchain();

const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(cors()); // Enable CORS

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/traceability', require('./routes/traceabilityRoutes'));
// app.use('/api/blockchain', require('./routes/blockchainRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
