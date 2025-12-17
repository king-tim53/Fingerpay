const Transaction = require('../model/Transaction');
const Customer = require('../model/Customer');
const Merchant = require('../model/Merchant');
const Agent = require('../model/Agent');
const { 
  generateTransactionId,
  verifyBiometric,
  successResponse, 
  errorResponse,
  calculateTransactionFee,
  paginate
} = require('../lib/helpers');
const { validateTransactionType, validateAmount } = require('../lib/validators');

// Initiate a transaction
exports.initiateTransaction = async (req, res) => {
  try {
    const { 
      customerId,
      merchantId,
      transactionType,
      amount,
      fingerUsed,
      fingerId,
      description,
      location,
      deviceId,
      metadata
    } = req.body;

    // Validate required fields
    if (!customerId || !transactionType || !amount) {
      return res.status(400).json(errorResponse('Customer ID, transaction type, and amount are required'));
    }

    // Validate transaction type
    if (!validateTransactionType(transactionType)) {
      return res.status(400).json(errorResponse('Invalid transaction type'));
    }

    // Validate amount
    if (!validateAmount(amount)) {
      return res.status(400).json(errorResponse('Invalid amount'));
    }

    // Get customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json(errorResponse('Customer not found'));
    }

    if (!customer.isActive) {
      return res.status(403).json(errorResponse('Customer account is inactive'));
    }

    // Verify biometric if provided
    if (fingerId && fingerUsed) {
      const fingerMapping = customer.fingerMapping.find(m => m.fingerName === fingerUsed);
      
      if (!fingerMapping) {
        return res.status(400).json(errorResponse('Finger not mapped'));
      }

      const isValidBiometric = verifyBiometric(fingerId, fingerMapping.fingerHash);
      if (!isValidBiometric) {
        return res.status(401).json(errorResponse('Biometric verification failed'));
      }

      // Check for panic finger
      if (fingerMapping.isPanicFinger) {
        // TODO: Trigger panic alert
        return res.status(200).json(successResponse({
          isPanicAlert: true,
          message: 'Panic alert triggered'
        }, 'Panic mode activated'));
      }
    }

    // Calculate fee
    const fee = calculateTransactionFee(amount);
    const totalAmount = amount + fee;

    // Check balance for withdrawal/payment transactions
    if (['payment', 'withdrawal', 'vault_deposit'].includes(transactionType)) {
      if (customer.balance < totalAmount) {
        return res.status(400).json(errorResponse('Insufficient balance'));
      }
    }

    // Get merchant if provided
    let merchant = null;
    if (merchantId) {
      merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        return res.status(404).json(errorResponse('Merchant not found'));
      }
    }

    // Generate transaction ID
    const transactionId = generateTransactionId();

    // Create transaction
    const transaction = new Transaction({
      transactionId,
      transactionType,
      customer: customerId,
      merchant: merchantId || null,
      amount,
      fee,
      totalAmount,
      fingerUsed: fingerUsed || null,
      description: description || '',
      location: location || {},
      deviceId: deviceId || null,
      metadata: metadata || {},
      status: 'pending'
    });

    await transaction.save();

    res.status(201).json(successResponse({
      transaction: {
        transactionId: transaction.transactionId,
        transactionType: transaction.transactionType,
        amount: transaction.amount,
        fee: transaction.fee,
        totalAmount: transaction.totalAmount,
        status: transaction.status,
        initiatedAt: transaction.initiatedAt
      }
    }, 'Transaction initiated successfully'));

  } catch (error) {
    console.error('Initiate transaction error:', error);
    res.status(500).json(errorResponse('Failed to initiate transaction', error.message));
  }
};

// Complete a transaction
exports.completeTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({ transactionId })
      .populate('customer')
      .populate('merchant')
      .populate('agent');

    if (!transaction) {
      return res.status(404).json(errorResponse('Transaction not found'));
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json(errorResponse('Transaction already processed'));
    }

    const customer = transaction.customer;
    const merchant = transaction.merchant;

    try {
      // Process transaction based on type
      switch (transaction.transactionType) {
        case 'payment':
          // Deduct from customer
          customer.balance -= transaction.totalAmount;
          
          // Credit merchant
          if (merchant) {
            merchant.balance += transaction.amount;
            merchant.totalSales += transaction.amount;
            merchant.totalTransactions += 1;
            
            // Update sales analytics
            merchant.salesAnalytics.averageDailySales = 
              (merchant.salesAnalytics.averageDailySales * merchant.totalTransactions + transaction.amount) / 
              (merchant.totalTransactions + 1);
            
            await merchant.save();
          }
          break;

        case 'withdrawal':
          // Deduct from customer
          customer.balance -= transaction.totalAmount;
          break;

        case 'transfer':
          // Deduct from customer
          customer.balance -= transaction.totalAmount;
          // TODO: Credit receiver
          break;

        case 'vault_deposit':
          // Move from balance to vault
          customer.balance -= transaction.amount;
          customer.vaultBalance += transaction.amount;
          break;

        case 'vault_withdrawal':
          // Move from vault to balance
          customer.vaultBalance -= transaction.amount;
          customer.balance += transaction.amount;
          break;

        case 'airtime':
        case 'data':
        case 'bills':
          // Deduct from customer
          customer.balance -= transaction.totalAmount;
          break;

        default:
          throw new Error('Invalid transaction type');
      }

      // Save customer
      customer.transactions.push(transaction._id);
      await customer.save();

      // Update transaction status
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      await transaction.save();

      res.status(200).json(successResponse({
        transaction: {
          transactionId: transaction.transactionId,
          transactionType: transaction.transactionType,
          amount: transaction.amount,
          status: transaction.status,
          completedAt: transaction.completedAt
        },
        newBalance: customer.balance,
        newVaultBalance: customer.vaultBalance
      }, 'Transaction completed successfully'));

    } catch (error) {
      // Mark transaction as failed
      transaction.status = 'failed';
      await transaction.save();
      throw error;
    }

  } catch (error) {
    console.error('Complete transaction error:', error);
    res.status(500).json(errorResponse('Failed to complete transaction', error.message));
  }
};

// Reverse a transaction
exports.reverseTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    const transaction = await Transaction.findOne({ transactionId })
      .populate('customer')
      .populate('merchant');

    if (!transaction) {
      return res.status(404).json(errorResponse('Transaction not found'));
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json(errorResponse('Only completed transactions can be reversed'));
    }

    const customer = transaction.customer;
    const merchant = transaction.merchant;

    try {
      // Reverse transaction based on type
      switch (transaction.transactionType) {
        case 'payment':
          // Credit customer
          customer.balance += transaction.totalAmount;
          
          // Deduct from merchant
          if (merchant) {
            merchant.balance -= transaction.amount;
            merchant.totalSales -= transaction.amount;
            merchant.totalTransactions -= 1;
            await merchant.save();
          }
          break;

        case 'withdrawal':
          // Credit customer
          customer.balance += transaction.totalAmount;
          break;

        case 'vault_deposit':
          // Reverse vault deposit
          customer.balance += transaction.amount;
          customer.vaultBalance -= transaction.amount;
          break;

        case 'vault_withdrawal':
          // Reverse vault withdrawal
          customer.vaultBalance += transaction.amount;
          customer.balance -= transaction.amount;
          break;

        default:
          // Credit customer for other transactions
          customer.balance += transaction.totalAmount;
      }

      await customer.save();

      // Update transaction status
      transaction.status = 'reversed';
      transaction.metadata = {
        ...transaction.metadata,
        reversalReason: reason || 'Not specified',
        reversedAt: new Date()
      };
      await transaction.save();

      res.status(200).json(successResponse({
        transaction: {
          transactionId: transaction.transactionId,
          status: transaction.status
        },
        newBalance: customer.balance
      }, 'Transaction reversed successfully'));

    } catch (error) {
      throw error;
    }

  } catch (error) {
    console.error('Reverse transaction error:', error);
    res.status(500).json(errorResponse('Failed to reverse transaction', error.message));
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({ transactionId })
      .populate('customer', 'firstName lastName email phone')
      .populate('merchant', 'businessName merchantId')
      .populate('agent', 'firstName lastName agentId');

    if (!transaction) {
      return res.status(404).json(errorResponse('Transaction not found'));
    }

    res.status(200).json(successResponse({ transaction }, 'Transaction retrieved'));

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json(errorResponse('Failed to get transaction', error.message));
  }
};

// Get all transactions (with filters)
exports.getAllTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      customerId, 
      merchantId,
      startDate,
      endDate
    } = req.query;

    const { skip, limit: pageLimit } = paginate(page, limit);

    const filter = {};
    if (type) filter.transactionType = type;
    if (status) filter.status = status;
    if (customerId) filter.customer = customerId;
    if (merchantId) filter.merchant = merchantId;
    
    if (startDate || endDate) {
      filter.initiatedAt = {};
      if (startDate) filter.initiatedAt.$gte = new Date(startDate);
      if (endDate) filter.initiatedAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('customer', 'firstName lastName phone')
      .populate('merchant', 'businessName merchantId')
      .populate('agent', 'firstName lastName agentId')
      .skip(skip)
      .limit(pageLimit)
      .sort({ initiatedAt: -1 });

    const total = await Transaction.countDocuments(filter);

    res.status(200).json(successResponse({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / pageLimit)
      }
    }, 'Transactions retrieved successfully'));

  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json(errorResponse('Failed to get transactions', error.message));
  }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.completedAt = {};
      if (startDate) dateFilter.completedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.completedAt.$lte = new Date(endDate);
    }

    // Total transactions by status
    const statusStats = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Transactions by type
    const typeStats = await Transaction.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: '$transactionType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Total volume and fees
    const volumeStats = await Transaction.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$amount' },
          totalFees: { $sum: '$fee' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(successResponse({
      statusStats,
      typeStats,
      volumeStats: volumeStats[0] || { totalVolume: 0, totalFees: 0, transactionCount: 0 }
    }, 'Transaction statistics retrieved'));

  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json(errorResponse('Failed to get statistics', error.message));
  }
};

module.exports = exports;
