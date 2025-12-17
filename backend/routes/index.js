const express = require('express');
const router = express.Router();

// Import route modules
const agentRoutes = require('./agentRoutes');
const customerRoutes = require('./customerRoutes');
const merchantRoutes = require('./merchantRoutes');
const transactionRoutes = require('./transactionRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FingerPay API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/agents', agentRoutes);
router.use('/customers', customerRoutes);
router.use('/merchants', merchantRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;
