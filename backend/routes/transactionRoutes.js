const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transactionController');
const { authenticate } = require('../lib/auth');

// Transaction routes
router.post('/initiate', transactionController.initiateTransaction); // Can be called by POS devices
router.put('/:transactionId/complete', transactionController.completeTransaction);
router.put('/:transactionId/reverse', authenticate(['admin', 'agent']), transactionController.reverseTransaction);
router.get('/:transactionId', authenticate(['agent', 'merchant', 'admin']), transactionController.getTransactionById);

// Admin/reporting routes
router.get('/', authenticate(['admin']), transactionController.getAllTransactions);
router.get('/stats/summary', authenticate(['admin']), transactionController.getTransactionStats);

module.exports = router;
