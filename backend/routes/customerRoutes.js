const express = require('express');
const router = express.Router();
const customerController = require('../controller/customerController');
const { authenticate } = require('../lib/auth');

// Public routes
router.post('/register', customerController.registerCustomer);
router.post('/login', customerController.loginCustomer);

// Protected routes (agent can enroll customers with biometric)
router.post('/enroll', authenticate(['agent']), customerController.enrollCustomer);

// Customer-specific routes
router.get('/:customerId', authenticate(['agent', 'admin']), customerController.getCustomerProfile);
router.put('/:customerId', authenticate(['agent', 'admin']), customerController.updateCustomerProfile);
router.post('/:customerId/finger-mapping', authenticate(['agent']), customerController.addFingerMapping);
router.post('/:customerId/verify', customerController.verifyBiometric); // Public for POS verification
router.get('/:customerId/transactions', authenticate(['agent', 'admin']), customerController.getCustomerTransactions);

// Vault operations
router.post('/:customerId/vault/deposit', authenticate(['agent']), customerController.vaultDeposit);
router.post('/:customerId/vault/withdraw', authenticate(['agent']), customerController.vaultWithdrawal);

// Admin routes
router.get('/', authenticate(['admin', 'agent']), customerController.getAllCustomers);

module.exports = router;
