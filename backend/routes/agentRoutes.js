const express = require('express');
const router = express.Router();
const agentController = require('../controller/agentController');
const { authenticate } = require('../lib/auth');

// Public routes
router.post('/register', agentController.registerAgent);
router.post('/login', agentController.loginAgent);

// Protected routes (require authentication)
router.get('/profile', authenticate(['agent']), agentController.getAgentProfile);
router.put('/profile', authenticate(['agent']), agentController.updateAgentProfile);
router.get('/dashboard', authenticate(['agent']), agentController.getAgentDashboard);
router.get('/customers', authenticate(['agent']), agentController.getEnrolledCustomers);
router.put('/liquidity', authenticate(['agent']), agentController.updateLiquidityStatus);

// Admin routes
router.get('/all', authenticate(['admin']), agentController.getAllAgents);

module.exports = router;
