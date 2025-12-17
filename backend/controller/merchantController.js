const Merchant = require('../model/Merchant');
const Transaction = require('../model/Transaction');
const { 
  generateMerchantId, 
  generateDeviceId,
  hashBiometric,
  successResponse, 
  errorResponse,
  calculateCreditScore,
  paginate
} = require('../lib/helpers');
const { generateToken } = require('../lib/auth');
const { validateRequiredFields, validateEmail, validatePhone } = require('../lib/validators');

// Register a new merchant
exports.registerMerchant = async (req, res) => {
  try {
    const { 
      businessName, 
      businessType, 
      rcNumber,
      ownerName,
      email, 
      phone, 
      address,
      password
    } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['businessName', 'businessType', 'ownerName', 'email', 'phone', 'password']);
    if (!validation.isValid) {
      return res.status(400).json(errorResponse('Missing required fields', validation.missingFields));
    }

    // Validate email and phone
    if (!validateEmail(email)) {
      return res.status(400).json(errorResponse('Invalid email format'));
    }
    if (!validatePhone(phone)) {
      return res.status(400).json(errorResponse('Invalid phone number. Must be 11 digits'));
    }

    // Check if merchant already exists
    const existingEmail = await Merchant.findOne({ email });
    if (existingEmail) {
      return res.status(400).json(errorResponse('A merchant with this email already exists'));
    }

    const existingPhone = await Merchant.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json(errorResponse('A merchant with this phone number already exists'));
    }

    // Generate merchant ID
    const merchantId = generateMerchantId();

    // Hash password
    const passwordHash = hashBiometric(password);

    // Create new merchant
    const merchant = new Merchant({
      businessName,
      businessType,
      rcNumber,
      ownerName,
      email,
      phone,
      merchantId,
      passwordHash,
      address: address || {}
    });

    await merchant.save();

    // Generate token
    const token = generateToken({
      id: merchant._id,
      merchantId: merchant.merchantId,
      role: 'merchant'
    });

    res.status(201).json(successResponse({
      merchant: {
        id: merchant._id,
        merchantId: merchant.merchantId,
        businessName: merchant.businessName,
        businessType: merchant.businessType,
        ownerName: merchant.ownerName,
        email: merchant.email,
        phone: merchant.phone
      },
      token
    }, 'Merchant registered successfully'));

  } catch (error) {
    console.error('Register merchant error:', error);
    res.status(500).json(errorResponse('Failed to register merchant', error.message));
  }
};

// Login merchant
exports.loginMerchant = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json(errorResponse('Email and password are required'));
    }

    // Find merchant
    const merchant = await Merchant.findOne({ email });
    if (!merchant) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Verify password
    const passwordHash = hashBiometric(password);
    if (passwordHash !== merchant.passwordHash) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Check if merchant is active
    if (!merchant.isActive) {
      return res.status(403).json(errorResponse('Account is inactive'));
    }

    // Generate token
    const token = generateToken({
      id: merchant._id,
      merchantId: merchant.merchantId,
      role: 'merchant'
    });

    res.status(200).json(successResponse({
      merchant: {
        id: merchant._id,
        merchantId: merchant.merchantId,
        businessName: merchant.businessName,
        businessType: merchant.businessType,
        ownerName: merchant.ownerName,
        email: merchant.email,
        phone: merchant.phone,
        balance: merchant.balance,
        creditScore: merchant.creditScore
      },
      token
    }, 'Login successful'));

  } catch (error) {
    console.error('Login merchant error:', error);
    res.status(500).json(errorResponse('Login failed', error.message));
  }
};

// Get merchant profile
exports.getMerchantProfile = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const merchant = await Merchant.findById(merchantId)
      .select('-passwordHash');

    if (!merchant) {
      return res.status(404).json(errorResponse('Merchant not found'));
    }

    res.status(200).json(successResponse({ merchant }, 'Merchant profile retrieved'));

  } catch (error) {
    console.error('Get merchant profile error:', error);
    res.status(500).json(errorResponse('Failed to get profile', error.message));
  }
};

// Update merchant profile
exports.updateMerchantProfile = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.merchantId;
    delete updates.passwordHash;
    delete updates.balance;
    delete updates.totalSales;
    delete updates.totalTransactions;
    delete updates.creditScore;
    delete updates.creditLimit;

    const merchant = await Merchant.findByIdAndUpdate(
      merchantId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!merchant) {
      return res.status(404).json(errorResponse('Merchant not found'));
    }

    res.status(200).json(successResponse({ merchant }, 'Profile updated successfully'));

  } catch (error) {
    console.error('Update merchant profile error:', error);
    res.status(500).json(errorResponse('Failed to update profile', error.message));
  }
};

// Add POS device
exports.addPOSDevice = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { serialNumber, assignedStaff } = req.body;

    if (!serialNumber) {
      return res.status(400).json(errorResponse('Serial number is required'));
    }

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json(errorResponse('Merchant not found'));
    }

    // Check if device already exists
    const existingDevice = merchant.posDevices.find(d => d.serialNumber === serialNumber);
    if (existingDevice) {
      return res.status(400).json(errorResponse('Device with this serial number already exists'));
    }

    // Generate device ID
    const deviceId = generateDeviceId();

    // Add device
    merchant.posDevices.push({
      deviceId,
      serialNumber,
      isActive: true,
      assignedStaff: assignedStaff || null
    });

    await merchant.save();

    res.status(200).json(successResponse({
      device: merchant.posDevices[merchant.posDevices.length - 1]
    }, 'POS device added successfully'));

  } catch (error) {
    console.error('Add POS device error:', error);
    res.status(500).json(errorResponse('Failed to add device', error.message));
  }
};

// Update POS device
exports.updatePOSDevice = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { deviceId } = req.params;
    const { isActive, assignedStaff } = req.body;

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json(errorResponse('Merchant not found'));
    }

    const device = merchant.posDevices.find(d => d.deviceId === deviceId);
    if (!device) {
      return res.status(404).json(errorResponse('Device not found'));
    }

    if (isActive !== undefined) {
      device.isActive = isActive;
    }
    if (assignedStaff !== undefined) {
      device.assignedStaff = assignedStaff;
    }

    await merchant.save();

    res.status(200).json(successResponse({ device }, 'Device updated successfully'));

  } catch (error) {
    console.error('Update POS device error:', error);
    res.status(500).json(errorResponse('Failed to update device', error.message));
  }
};

// Get merchant dashboard
exports.getMerchantDashboard = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json(errorResponse('Merchant not found'));
    }

    // Get transaction stats for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await Transaction.countDocuments({
      merchant: merchantId,
      status: 'completed',
      completedAt: { $gte: today }
    });

    const todaySales = await Transaction.aggregate([
      {
        $match: {
          merchant: merchant._id,
          status: 'completed',
          completedAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const dashboard = {
      merchantInfo: {
        businessName: merchant.businessName,
        merchantId: merchant.merchantId,
        balance: merchant.balance,
        creditScore: merchant.creditScore,
        creditLimit: merchant.creditLimit
      },
      todayStats: {
        transactions: todayTransactions,
        sales: todaySales[0]?.total || 0
      },
      overallStats: {
        totalSales: merchant.totalSales,
        totalTransactions: merchant.totalTransactions
      },
      posDevices: merchant.posDevices.filter(d => d.isActive).length,
      salesAnalytics: merchant.salesAnalytics
    };

    res.status(200).json(successResponse({ dashboard }, 'Dashboard data retrieved'));

  } catch (error) {
    console.error('Get merchant dashboard error:', error);
    res.status(500).json(errorResponse('Failed to get dashboard', error.message));
  }
};

// Update credit score
exports.updateCreditScore = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json(errorResponse('Merchant not found'));
    }

    // Calculate new credit score
    const newScore = calculateCreditScore(merchant.salesAnalytics);
    merchant.creditScore = newScore;

    // Update credit limit based on score
    if (newScore >= 80) {
      merchant.creditLimit = 5000000; // ₦5M
    } else if (newScore >= 60) {
      merchant.creditLimit = 2000000; // ₦2M
    } else if (newScore >= 40) {
      merchant.creditLimit = 1000000; // ₦1M
    } else if (newScore >= 20) {
      merchant.creditLimit = 500000; // ₦500K
    } else {
      merchant.creditLimit = 0;
    }

    await merchant.save();

    res.status(200).json(successResponse({
      creditScore: merchant.creditScore,
      creditLimit: merchant.creditLimit
    }, 'Credit score updated'));

  } catch (error) {
    console.error('Update credit score error:', error);
    res.status(500).json(errorResponse('Failed to update credit score', error.message));
  }
};

// Get merchant transactions
exports.getMerchantTransactions = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const { skip, limit: pageLimit } = paginate(page, limit);

    const filter = { merchant: merchantId };
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.initiatedAt = {};
      if (startDate) filter.initiatedAt.$gte = new Date(startDate);
      if (endDate) filter.initiatedAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('customer', 'firstName lastName phone')
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
    console.error('Get merchant transactions error:', error);
    res.status(500).json(errorResponse('Failed to get transactions', error.message));
  }
};

// Get all merchants (admin only)
exports.getAllMerchants = async (req, res) => {
  try {
    const { page = 1, limit = 10, businessType, isActive } = req.query;

    const { skip, limit: pageLimit } = paginate(page, limit);

    const filter = {};
    if (businessType) filter.businessType = businessType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const merchants = await Merchant.find(filter)
      .select('-passwordHash')
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    const total = await Merchant.countDocuments(filter);

    res.status(200).json(successResponse({
      merchants,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / pageLimit)
      }
    }, 'Merchants retrieved successfully'));

  } catch (error) {
    console.error('Get all merchants error:', error);
    res.status(500).json(errorResponse('Failed to get merchants', error.message));
  }
};

module.exports = exports;
