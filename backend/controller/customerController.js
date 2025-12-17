const Customer = require('../model/Customer');
const Agent = require('../model/Agent');
const Transaction = require('../model/Transaction');
const { 
  hashBiometric, 
  verifyBiometric,
  successResponse, 
  errorResponse,
  paginate
} = require('../lib/helpers');
const { generateToken } = require('../lib/auth');
const { validateRequiredFields, validateEmail, validatePhone, validateFingerName } = require('../lib/validators');

// Self-register a new customer (public registration)
exports.registerCustomer = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone,
      password
    } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['firstName', 'lastName', 'email', 'phone', 'password']);
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

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ $or: [{ email }, { phone }] });
    if (existingCustomer) {
      return res.status(400).json(errorResponse('Customer with this email or phone already exists'));
    }

    // Hash password (temporary fingerId until biometric enrollment)
    const passwordHash = hashBiometric(password);

    // Create new customer (without biometric data initially)
    const customer = new Customer({
      firstName,
      lastName,
      email,
      phone,
      fingerId: passwordHash, // Temporary until biometric enrollment
      isVerified: false, // Not verified until biometric enrollment
      fingerMapping: []
    });

    await customer.save();

    // Generate token
    const token = generateToken({
      id: customer._id,
      role: 'customer'
    });

    res.status(201).json(successResponse({
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        isVerified: customer.isVerified,
        enrollmentDate: customer.enrollmentDate
      },
      token,
      message: 'Account created! Visit an agent to complete biometric enrollment.'
    }, 'Customer registered successfully'));

  } catch (error) {
    console.error('Register customer error:', error);
    res.status(500).json(errorResponse('Failed to register customer', error.message));
  }
};

// Login customer
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json(errorResponse('Email and password are required'));
    }

    // Find customer
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Verify password (check against fingerId which stores the password hash for non-biometric customers)
    const passwordHash = hashBiometric(password);
    if (passwordHash !== customer.fingerId && !customer.isVerified) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Check if customer is active
    if (!customer.isActive) {
      return res.status(403).json(errorResponse('Account is inactive'));
    }

    // Generate token
    const token = generateToken({
      id: customer._id,
      role: 'customer'
    });

    res.status(200).json(successResponse({
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        balance: customer.balance,
        vaultBalance: customer.vaultBalance,
        isVerified: customer.isVerified
      },
      token,
      needsBiometricEnrollment: !customer.isVerified
    }, 'Login successful'));

  } catch (error) {
    console.error('Login customer error:', error);
    res.status(500).json(errorResponse('Login failed', error.message));
  }
};

// Enroll a new customer (Agent-assisted with biometric)
exports.enrollCustomer = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      fingerId,
      fingerMapping,
      panicFinger,
      vaultFinger
    } = req.body;

    const agentId = req.user.id;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['firstName', 'lastName', 'email', 'phone', 'fingerId']);
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

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ $or: [{ email }, { phone }] });
    if (existingCustomer) {
      return res.status(400).json(errorResponse('Customer with this email or phone already exists'));
    }

    // Hash biometric data
    const hashedFingerId = hashBiometric(fingerId);

    // Process finger mappings
    const processedMappings = fingerMapping?.map(mapping => ({
      ...mapping,
      fingerHash: hashBiometric(mapping.fingerHash || fingerId)
    })) || [];

    // Create new customer
    const customer = new Customer({
      firstName,
      lastName,
      email,
      phone,
      fingerId: hashedFingerId,
      fingerMapping: processedMappings,
      panicFinger: panicFinger || 'left_pinky',
      vaultFinger: vaultFinger || 'right_ring',
      enrolledBy: agentId
    });

    await customer.save();

    // Update agent's performance
    const agent = await Agent.findById(agentId);
    if (agent) {
      agent.performance.totalRegistrations += 1;
      agent.performance.monthlyRegistrations += 1;
      agent.performance.weeklyRegistrations += 1;
      agent.performance.totalEarnings += agent.commissionRate.registrationFee;
      agent.performance.monthlyEarnings += agent.commissionRate.registrationFee;
      agent.balance += agent.commissionRate.registrationFee;
      agent.customersEnrolled.push(customer._id);
      await agent.save();
    }

    res.status(201).json(successResponse({
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        enrollmentDate: customer.enrollmentDate,
        isActive: customer.isActive
      },
      agentEarnings: agent?.commissionRate.registrationFee || 0
    }, 'Customer enrolled successfully'));

  } catch (error) {
    console.error('Enroll customer error:', error);
    res.status(500).json(errorResponse('Failed to enroll customer', error.message));
  }
};

// Get customer profile
exports.getCustomerProfile = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId)
      .populate('enrolledBy', 'firstName lastName agentId')
      .select('-fingerId -fingerMapping.fingerHash');

    if (!customer) {
      return res.status(404).json(errorResponse('Customer not found'));
    }

    res.status(200).json(successResponse({ customer }, 'Customer profile retrieved'));

  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json(errorResponse('Failed to get profile', error.message));
  }
};

// Update customer profile
exports.updateCustomerProfile = async (req, res) => {
  try {
    const { customerId } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.fingerId;
    delete updates.fingerMapping;
    delete updates.balance;
    delete updates.vaultBalance;
    delete updates.transactions;
    delete updates.enrolledBy;

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-fingerId -fingerMapping.fingerHash');

    if (!customer) {
      return res.status(404).json(errorResponse('Customer not found'));
    }

    res.status(200).json(successResponse({ customer }, 'Profile updated successfully'));

  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json(errorResponse('Failed to update profile', error.message));
  }
};

// Add finger mapping
exports.addFingerMapping = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { fingerName, bankName, accountNumber, fingerHash, isPanicFinger, isVaultFinger } = req.body;

    // Validate finger name
    if (!validateFingerName(fingerName)) {
      return res.status(400).json(errorResponse('Invalid finger name'));
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json(errorResponse('Customer not found'));
    }

    // Check if finger already mapped
    const existingMapping = customer.fingerMapping.find(m => m.fingerName === fingerName);
    if (existingMapping) {
      return res.status(400).json(errorResponse('This finger is already mapped'));
    }

    // Hash the finger data
    const hashedFinger = hashBiometric(fingerHash);

    // Add new mapping
    customer.fingerMapping.push({
      fingerName,
      bankName,
      accountNumber,
      fingerHash: hashedFinger,
      isPanicFinger: isPanicFinger || false,
      isVaultFinger: isVaultFinger || false
    });

    await customer.save();

    res.status(200).json(successResponse({
      fingerMapping: customer.fingerMapping.map(m => ({
        fingerName: m.fingerName,
        bankName: m.bankName,
        accountNumber: m.accountNumber,
        isPanicFinger: m.isPanicFinger,
        isVaultFinger: m.isVaultFinger
      }))
    }, 'Finger mapping added successfully'));

  } catch (error) {
    console.error('Add finger mapping error:', error);
    res.status(500).json(errorResponse('Failed to add finger mapping', error.message));
  }
};

// Verify customer biometric
exports.verifyBiometric = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { fingerId, fingerName } = req.body;

    if (!fingerId) {
      return res.status(400).json(errorResponse('Finger ID is required'));
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json(errorResponse('Customer not found'));
    }

    // Verify main finger ID
    const isValidMainFinger = verifyBiometric(fingerId, customer.fingerId);
    
    // If fingerName provided, check specific finger mapping
    let fingerDetails = null;
    if (fingerName) {
      const mapping = customer.fingerMapping.find(m => m.fingerName === fingerName);
      if (mapping) {
        const isValidFinger = verifyBiometric(fingerId, mapping.fingerHash);
        if (isValidFinger) {
          fingerDetails = {
            fingerName: mapping.fingerName,
            bankName: mapping.bankName,
            accountNumber: mapping.accountNumber,
            isPanicFinger: mapping.isPanicFinger,
            isVaultFinger: mapping.isVaultFinger
          };
        }
      }
    }

    if (!isValidMainFinger && !fingerDetails) {
      return res.status(401).json(errorResponse('Biometric verification failed'));
    }

    res.status(200).json(successResponse({
      verified: true,
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        balance: customer.balance,
        vaultBalance: customer.vaultBalance
      },
      fingerDetails
    }, 'Biometric verified successfully'));

  } catch (error) {
    console.error('Verify biometric error:', error);
    res.status(500).json(errorResponse('Verification failed', error.message));
  }
};

// Vault operations
exports.vaultDeposit = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json(errorResponse('Invalid amount'));
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json(errorResponse('Customer not found'));
    }

    if (customer.balance < amount) {
      return res.status(400).json(errorResponse('Insufficient balance'));
    }

    // Move money from balance to vault
    customer.balance -= amount;
    customer.vaultBalance += amount;
    await customer.save();

    res.status(200).json(successResponse({
      balance: customer.balance,
      vaultBalance: customer.vaultBalance
    }, 'Vault deposit successful'));

  } catch (error) {
    console.error('Vault deposit error:', error);
    res.status(500).json(errorResponse('Vault deposit failed', error.message));
  }
};

exports.vaultWithdrawal = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json(errorResponse('Invalid amount'));
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json(errorResponse('Customer not found'));
    }

    if (customer.vaultBalance < amount) {
      return res.status(400).json(errorResponse('Insufficient vault balance'));
    }

    // Move money from vault to balance
    customer.vaultBalance -= amount;
    customer.balance += amount;
    await customer.save();

    res.status(200).json(successResponse({
      balance: customer.balance,
      vaultBalance: customer.vaultBalance
    }, 'Vault withdrawal successful'));

  } catch (error) {
    console.error('Vault withdrawal error:', error);
    res.status(500).json(errorResponse('Vault withdrawal failed', error.message));
  }
};

// Get customer transaction history
exports.getCustomerTransactions = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10, type, status } = req.query;

    const { skip, limit: pageLimit } = paginate(page, limit);

    const filter = { customer: customerId };
    if (type) filter.transactionType = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
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
    console.error('Get customer transactions error:', error);
    res.status(500).json(errorResponse('Failed to get transactions', error.message));
  }
};

// Get all customers (admin/agent)
exports.getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, enrolledBy } = req.query;

    const { skip, limit: pageLimit } = paginate(page, limit);

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (enrolledBy) filter.enrolledBy = enrolledBy;

    const customers = await Customer.find(filter)
      .populate('enrolledBy', 'firstName lastName agentId')
      .select('-fingerId -fingerMapping.fingerHash')
      .skip(skip)
      .limit(pageLimit)
      .sort({ enrollmentDate: -1 });

    const total = await Customer.countDocuments(filter);

    res.status(200).json(successResponse({
      customers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / pageLimit)
      }
    }, 'Customers retrieved successfully'));

  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json(errorResponse('Failed to get customers', error.message));
  }
};

module.exports = exports;
