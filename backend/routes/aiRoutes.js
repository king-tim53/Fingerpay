/**
 * AI Routes
 * Endpoints for FinCoach, Credit AI, and FinAgent features
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');
const { authenticateToken } = require('../lib/auth');

// ==================== FINCOACH AI (CUSTOMER) ====================
// All customer AI endpoints require authentication

/**
 * @route   POST /api/ai/fincoach/analyze-budget
 * @desc    Analyze customer budget and provide recommendations
 * @access  Private (Customer only)
 */
router.post('/fincoach/analyze-budget', authenticateToken, aiController.analyzeBudget);

/**
 * @route   POST /api/ai/fincoach/check-overspending
 * @desc    Check if customer is overspending
 * @access  Private (Customer only)
 */
router.post('/fincoach/check-overspending', authenticateToken, aiController.checkOverspending);

/**
 * @route   POST /api/ai/fincoach/suggest-vault
 * @desc    Suggest vault deposit amount
 * @access  Private (Customer only)
 */
router.post('/fincoach/suggest-vault', authenticateToken, aiController.suggestVaultDeposit);

// ==================== CREDIT AI (MERCHANT) ====================
// All merchant AI endpoints require authentication

/**
 * @route   POST /api/ai/credit/loan-eligibility
 * @desc    Calculate merchant loan eligibility
 * @access  Private (Merchant only)
 */
router.post('/credit/loan-eligibility', authenticateToken, aiController.calculateLoanEligibility);

/**
 * @route   POST /api/ai/credit/what-if
 * @desc    Generate What-If business scenario
 * @access  Private (Merchant only)
 */
router.post('/credit/what-if', authenticateToken, aiController.generateWhatIfScenario);

/**
 * @route   POST /api/ai/credit/business-health
 * @desc    Analyze business health score
 * @access  Private (Merchant only)
 */
router.post('/credit/business-health', authenticateToken, aiController.analyzeBusinessHealth);

// ==================== FINAGENT AI (AGENT) ====================
// All agent AI endpoints require authentication

/**
 * @route   POST /api/ai/finagent/predict-liquidity
 * @desc    Predict liquidity demand in agent's area
 * @access  Private (Agent only)
 */
router.post('/finagent/predict-liquidity', authenticateToken, aiController.predictLiquidity);

/**
 * @route   POST /api/ai/finagent/explain-jargon
 * @desc    Explain financial jargon in local languages
 * @access  Private (Agent only)
 */
router.post('/finagent/explain-jargon', authenticateToken, aiController.explainJargon);

/**
 * @route   POST /api/ai/finagent/optimize-commissions
 * @desc    Get commission optimization recommendations
 * @access  Private (Agent only)
 */
router.post('/finagent/optimize-commissions', authenticateToken, aiController.optimizeCommissions);

/**
 * @route   POST /api/ai/finagent/detect-duplicate
 * @desc    Detect duplicate enrollment (fraud prevention)
 * @access  Private (Agent only)
 */
router.post('/finagent/detect-duplicate', authenticateToken, aiController.detectDuplicateEnrollment);

module.exports = router;
