const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/database");

// Import routes
const apiRoutes = require("./routes");

// Import error handlers
const { errorHandler, notFound } = require("./lib/errorHandler");

const PORT = process.env.PORT || 3000;
const app = express();

// Connect to database
connectDB();

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Request logging middleware
app.use((req, res, next) => {
  // ✅ FIXED: Added parentheses instead of backticks
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to FingerPay API',
    version: process.env.API_VERSION || '1.0.0',
    endpoints: {
      health: '/api/health',
      agents: '/api/agents',
      customers: '/api/customers',
      merchants: '/api/merchants',
      transactions: '/api/transactions'
    }
  });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  // ✅ FIXED: Added parentheses instead of backticks
  console.log(`✅ FingerPay API is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
});
