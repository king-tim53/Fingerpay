const express = require('express');
const router = express.Router();

// Import route modules
const agentRoutes = require('./agentRoutes');
const customerRoutes = require('./customerRoutes');
const merchantRoutes = require('./merchantRoutes');
const transactionRoutes = require('./transactionRoutes');
const aiRoutes = require('./aiRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FingerPay API is running',
    version: process.env.API_VERSION || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Version info route
router.get('/version', (req, res) => {
  res.status(200).json({
    success: true,
    version: process.env.API_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/agents', agentRoutes);
router.use('/customers', customerRoutes);
router.use('/merchants', merchantRoutes);
router.use('/transactions', transactionRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
