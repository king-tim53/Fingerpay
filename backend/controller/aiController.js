/**
 * AI Controller
 * Handles all AI-related endpoints for FinCoach, Credit AI, and FinAgent
 */

const aiService = require('../services/aiService');
const { asyncHandler } = require('../lib/errorHandler');
const Customer = require('../model/Customer');
const Merchant = require('../model/Merchant');
const Agent = require('../model/Agent');
const Transaction = require('../model/Transaction');

// ==================== FINCOACH AI (CUSTOMER) ====================

/**
 * Analyze customer budget
 * POST /api/ai/fincoach/analyze-budget
 */
exports.analyzeBudget = asyncHandler(async (req, res) => {
    const customerId = req.user.id;
    
    // Get customer data
    const customer = await Customer.findById(customerId);
    if (!customer) {
        return res.status(404).json({
            success: false,
            message: 'Customer not found'
        });
    }

    // Calculate spending from transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await Transaction.find({
        customerId: customerId,
        createdAt: { $gte: thirtyDaysAgo },
        status: 'completed'
    });

    const spending = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Get custom data from request or use defaults
    const customerData = {
        balance: customer.balance || 0,
        spending: spending,
        income: req.body.monthlyIncome || customer.estimatedIncome || 50000,
        monthlyAverage: req.body.monthlyAverage || spending
    };

    const analysis = await aiService.analyzeBudget(customerData);

    res.status(200).json({
        success: true,
        data: {
            analysis,
            customerData: {
                balance: customerData.balance,
                spending: customerData.spending,
                income: customerData.income,
                spendingPercentage: ((customerData.spending / customerData.income) * 100).toFixed(1)
            }
        }
    });
});

/**
 * Check overspending alert
 * POST /api/ai/fincoach/check-overspending
 */
exports.checkOverspending = asyncHandler(async (req, res) => {
    const { spending, monthlyAverage } = req.body;

    if (!spending || !monthlyAverage) {
        return res.status(400).json({
            success: false,
            message: 'spending and monthlyAverage are required'
        });
    }

    const alert = await aiService.checkOverspending(spending, monthlyAverage);

    res.status(200).json({
        success: true,
        data: {
            shouldAlert: alert !== null,
            message: alert,
            spendingPercentage: ((spending / monthlyAverage) * 100).toFixed(1)
        }
    });
});

/**
 * Suggest vault deposit
 * POST /api/ai/fincoach/suggest-vault
 */
exports.suggestVaultDeposit = asyncHandler(async (req, res) => {
    const { balance, spending, savingsGoal } = req.body;

    if (!balance || !spending || !savingsGoal) {
        return res.status(400).json({
            success: false,
            message: 'balance, spending, and savingsGoal are required'
        });
    }

    const suggestion = await aiService.suggestVaultDeposit(balance, spending, savingsGoal);

    res.status(200).json({
        success: true,
        data: {
            suggestion
        }
    });
});

// ==================== CREDIT AI (MERCHANT) ====================

/**
 * Calculate loan eligibility
 * POST /api/ai/credit/loan-eligibility
 */
exports.calculateLoanEligibility = asyncHandler(async (req, res) => {
    const merchantId = req.user.id;

    // Get merchant data
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
        return res.status(404).json({
            success: false,
            message: 'Merchant not found'
        });
    }

    // Get transaction data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await Transaction.find({
        merchantId: merchantId,
        createdAt: { $gte: thirtyDaysAgo }
    });

    const sales = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    const refunds = transactions.filter(t => t.status === 'refunded').reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = transactions.filter(t => t.status === 'completed').length;

    // Calculate business age in months
    const businessAge = Math.floor((Date.now() - merchant.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30));

    const merchantData = {
        sales,
        refunds: refunds || 0,
        monthlyRevenue: sales,
        businessAge: businessAge || 1,
        transactionCount
    };

    const analysis = await aiService.calculateLoanEligibility(merchantData);

    res.status(200).json({
        success: true,
        data: {
            analysis,
            businessMetrics: {
                monthlyRevenue: sales,
                transactionCount,
                refundRate: sales > 0 ? ((refunds / sales) * 100).toFixed(1) : 0,
                businessAge
            }
        }
    });
});

/**
 * Generate What-If scenario
 * POST /api/ai/credit/what-if
 */
exports.generateWhatIfScenario = asyncHandler(async (req, res) => {
    const { scenario, currentRevenue } = req.body;

    if (!scenario || !currentRevenue) {
        return res.status(400).json({
            success: false,
            message: 'scenario and currentRevenue are required'
        });
    }

    const validScenarios = ['stock', 'staff', 'marketing', 'expansion'];
    if (!validScenarios.includes(scenario)) {
        return res.status(400).json({
            success: false,
            message: `Invalid scenario. Must be one of: ${validScenarios.join(', ')}`
        });
    }

    const prediction = await aiService.generateWhatIfScenario(scenario, currentRevenue);

    res.status(200).json({
        success: true,
        data: {
            scenario,
            currentRevenue,
            prediction
        }
    });
});

/**
 * Analyze business health
 * POST /api/ai/credit/business-health
 */
exports.analyzeBusinessHealth = asyncHandler(async (req, res) => {
    const merchantId = req.user.id;

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
        return res.status(404).json({
            success: false,
            message: 'Merchant not found'
        });
    }

    // Get all transactions
    const transactions = await Transaction.find({ merchantId });
    
    const completed = transactions.filter(t => t.status === 'completed');
    const sales = completed.reduce((sum, t) => sum + t.amount, 0);
    const refunds = transactions.filter(t => t.status === 'refunded').reduce((sum, t) => sum + t.amount, 0);
    const avgTransactionValue = completed.length > 0 ? sales / completed.length : 0;

    // Calculate customer retention (simplified)
    const uniqueCustomers = new Set(completed.map(t => t.customerId.toString())).size;
    const repeatCustomers = completed.length - uniqueCustomers;
    const customerRetention = uniqueCustomers > 0 ? ((repeatCustomers / uniqueCustomers) * 100) : 0;

    const merchantData = {
        sales,
        refunds: refunds || 0,
        avgTransactionValue,
        customerRetention: customerRetention.toFixed(1)
    };

    const analysis = await aiService.analyzeBusinessHealth(merchantData);

    res.status(200).json({
        success: true,
        data: {
            analysis,
            metrics: merchantData
        }
    });
});

// ==================== FINAGENT AI (AGENT) ====================

/**
 * Predict liquidity demand
 * POST /api/ai/finagent/predict-liquidity
 */
exports.predictLiquidity = asyncHandler(async (req, res) => {
    const agentId = req.user.id;

    const agent = await Agent.findById(agentId);
    if (!agent) {
        return res.status(404).json({
            success: false,
            message: 'Agent not found'
        });
    }

    // Get registrations today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const registrationsToday = await Customer.countDocuments({
        agentId: agentId,
        createdAt: { $gte: todayStart }
    });

    const now = new Date();
    const agentData = {
        location: agent.location?.lga || 'Unknown',
        currentTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        registrationsToday,
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
        weather: req.body.weather || 'Normal'
    };

    const prediction = await aiService.predictLiquidity(agentData);

    res.status(200).json({
        success: true,
        data: {
            prediction,
            agentData: {
                location: agentData.location,
                registrationsToday,
                currentTime: agentData.currentTime,
                dayOfWeek: agentData.dayOfWeek
            }
        }
    });
});

/**
 * Explain financial jargon
 * POST /api/ai/finagent/explain-jargon
 */
exports.explainJargon = asyncHandler(async (req, res) => {
    const { term, language } = req.body;

    if (!term) {
        return res.status(400).json({
            success: false,
            message: 'term is required'
        });
    }

    const validLanguages = ['pidgin', 'yoruba', 'igbo', 'hausa', 'english'];
    const selectedLanguage = language || 'pidgin';

    if (!validLanguages.includes(selectedLanguage)) {
        return res.status(400).json({
            success: false,
            message: `Invalid language. Must be one of: ${validLanguages.join(', ')}`
        });
    }

    const explanation = await aiService.explainJargon(term, selectedLanguage);

    res.status(200).json({
        success: true,
        data: {
            term,
            language: selectedLanguage,
            explanation
        }
    });
});

/**
 * Optimize agent commissions
 * POST /api/ai/finagent/optimize-commissions
 */
exports.optimizeCommissions = asyncHandler(async (req, res) => {
    const agentId = req.user.id;

    const agent = await Agent.findById(agentId);
    if (!agent) {
        return res.status(404).json({
            success: false,
            message: 'Agent not found'
        });
    }

    // Get this month's registrations
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const registrations = await Customer.countDocuments({
        agentId: agentId,
        createdAt: { $gte: monthStart }
    });

    // Calculate earnings (assuming commission per registration)
    const commissionPerReg = 500; // ₦500 per registration
    const earnings = registrations * commissionPerReg;

    // Define level targets
    const levelTargets = {
        'AG-LV1': 50,
        'AG-LV2': 100,
        'AG-LV3': 200
    };

    const currentLevel = agent.level || 'AG-LV1';
    const target = levelTargets[currentLevel] || 50;

    const agentData = {
        currentLevel,
        registrations,
        earnings,
        target
    };

    const optimization = await aiService.optimizeCommissions(agentData);

    res.status(200).json({
        success: true,
        data: {
            optimization,
            currentStats: {
                level: currentLevel,
                registrations,
                earnings,
                target,
                progress: ((registrations / target) * 100).toFixed(1)
            }
        }
    });
});

/**
 * Detect duplicate enrollment (fraud prevention)
 * POST /api/ai/finagent/detect-duplicate
 */
exports.detectDuplicateEnrollment = asyncHandler(async (req, res) => {
    const { fingerprintCount, quality, speed } = req.body;

    if (!fingerprintCount || !quality || !speed) {
        return res.status(400).json({
            success: false,
            message: 'fingerprintCount, quality, and speed are required'
        });
    }

    const agentId = req.user.id;

    // Get recent enrollments in agent's area (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEnrollments = await Customer.countDocuments({
        agentId: agentId,
        createdAt: { $gte: oneHourAgo }
    });

    const fingerprintData = {
        count: fingerprintCount,
        quality,
        recentEnrollments,
        speed
    };

    const analysis = await aiService.detectDuplicateEnrollment(fingerprintData);

    res.status(200).json({
        success: true,
        data: {
            analysis,
            enrollmentData: fingerprintData
        }
    });
});
