const express = require('express');
const router = express.Router();
const merchantController = require('../controller/merchantController');
const { authenticate } = require('../lib/auth');

// Public routes
router.post('/register', merchantController.registerMerchant);
router.post('/login', merchantController.loginMerchant);

// Protected routes (require authentication)
router.get('/profile', authenticate(['merchant']), merchantController.getMerchantProfile);
router.put('/profile', authenticate(['merchant']), merchantController.updateMerchantProfile);
router.get('/dashboard', authenticate(['merchant']), merchantController.getMerchantDashboard);
router.get('/transactions', authenticate(['merchant']), merchantController.getMerchantTransactions);

// POS device management
router.post('/pos-devices', authenticate(['merchant']), merchantController.addPOSDevice);
router.put('/pos-devices/:deviceId', authenticate(['merchant']), merchantController.updatePOSDevice);

// Credit score
router.put('/credit-score', authenticate(['merchant']), merchantController.updateCreditScore);

// Admin routes
router.get('/all', authenticate(['admin']), merchantController.getAllMerchants);

module.exports = router;
