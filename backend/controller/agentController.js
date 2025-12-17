const Agent = require('../model/Agent');
const Customer = require('../model/Customer');
const { 
  generateAgentId, 
  hashBiometric, 
  successResponse, 
  errorResponse,
  calculateAgentLevel,
  paginate
} = require('../lib/helpers');
const { generateToken } = require('../lib/auth');
const { validateRequiredFields, validateEmail, validatePhone } = require('../lib/validators');

// Register a new agent
exports.registerAgent = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, location, password } = req.body;

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

    // Check if agent already exists
    const existingEmail = await Agent.findOne({ email });
    if (existingEmail) {
      return res.status(400).json(errorResponse('An agent with this email already exists'));
    }

    const existingPhone = await Agent.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json(errorResponse('An agent with this phone number already exists'));
    }

    // Generate agent ID
    const agentId = generateAgentId();

    // Hash password
    const passwordHash = hashBiometric(password);

    // Create new agent
    const agent = new Agent({
      firstName,
      lastName,
      email,
      phone,
      agentId,
      passwordHash,
      location: location || {}
    });

    await agent.save();

    // Generate token
    const token = generateToken({
      id: agent._id,
      agentId: agent.agentId,
      role: 'agent'
    });

    res.status(201).json(successResponse({
      agent: {
        id: agent._id,
        agentId: agent.agentId,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        phone: agent.phone,
        agentLevel: agent.agentLevel
      },
      token
    }, 'Agent registered successfully'));

  } catch (error) {
    console.error('Register agent error:', error);
    res.status(500).json(errorResponse('Failed to register agent', error.message));
  }
};

// Login agent
exports.loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json(errorResponse('Email and password are required'));
    }

    // Find agent
    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Verify password
    const passwordHash = hashBiometric(password);
    if (passwordHash !== agent.passwordHash) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    // Check if agent is active
    if (!agent.isActive) {
      return res.status(403).json(errorResponse('Account is inactive'));
    }

    // Update last login
    agent.lastLogin = new Date();
    await agent.save();

    // Generate token
    const token = generateToken({
      id: agent._id,
      agentId: agent.agentId,
      role: 'agent'
    });

    res.status(200).json(successResponse({
      agent: {
        id: agent._id,
        agentId: agent.agentId,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        phone: agent.phone,
        agentLevel: agent.agentLevel,
        balance: agent.balance,
        performance: agent.performance
      },
      token
    }, 'Login successful'));

  } catch (error) {
    console.error('Login agent error:', error);
    res.status(500).json(errorResponse('Login failed', error.message));
  }
};

// Get agent profile
exports.getAgentProfile = async (req, res) => {
  try {
    const agentId = req.user.id;

    const agent = await Agent.findById(agentId)
      .populate('customersEnrolled', 'firstName lastName email phone')
      .select('-passwordHash');

    if (!agent) {
      return res.status(404).json(errorResponse('Agent not found'));
    }

    res.status(200).json(successResponse({ agent }, 'Agent profile retrieved'));

  } catch (error) {
    console.error('Get agent profile error:', error);
    res.status(500).json(errorResponse('Failed to get profile', error.message));
  }
};

// Update agent profile
exports.updateAgentProfile = async (req, res) => {
  try {
    const agentId = req.user.id;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.agentId;
    delete updates.passwordHash;
    delete updates.balance;
    delete updates.performance;
    delete updates.customersEnrolled;

    const agent = await Agent.findByIdAndUpdate(
      agentId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!agent) {
      return res.status(404).json(errorResponse('Agent not found'));
    }

    res.status(200).json(successResponse({ agent }, 'Profile updated successfully'));

  } catch (error) {
    console.error('Update agent profile error:', error);
    res.status(500).json(errorResponse('Failed to update profile', error.message));
  }
};

// Get agent dashboard stats
exports.getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user.id;

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json(errorResponse('Agent not found'));
    }

    // Get customer count
    const customerCount = await Customer.countDocuments({ enrolledBy: agentId });

    // Calculate level based on total registrations
    const calculatedLevel = calculateAgentLevel(agent.performance.totalRegistrations);
    if (calculatedLevel !== agent.agentLevel) {
      agent.agentLevel = calculatedLevel;
      await agent.save();
    }

    const dashboard = {
      agentInfo: {
        name: `${agent.firstName} ${agent.lastName}`,
        agentId: agent.agentId,
        level: agent.agentLevel,
        balance: agent.balance
      },
      performance: agent.performance,
      customers: {
        total: customerCount,
        active: await Customer.countDocuments({ enrolledBy: agentId, isActive: true })
      },
      liquidity: agent.liquidityStatus
    };

    res.status(200).json(successResponse({ dashboard }, 'Dashboard data retrieved'));

  } catch (error) {
    console.error('Get agent dashboard error:', error);
    res.status(500).json(errorResponse('Failed to get dashboard', error.message));
  }
};

// Get agent's enrolled customers
exports.getEnrolledCustomers = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const { skip, limit: pageLimit } = paginate(page, limit);

    const customers = await Customer.find({ enrolledBy: agentId })
      .select('firstName lastName email phone isActive enrollmentDate balance')
      .skip(skip)
      .limit(pageLimit)
      .sort({ enrollmentDate: -1 });

    const total = await Customer.countDocuments({ enrolledBy: agentId });

    res.status(200).json(successResponse({
      customers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / pageLimit)
      }
    }, 'Customers retrieved successfully'));

  } catch (error) {
    console.error('Get enrolled customers error:', error);
    res.status(500).json(errorResponse('Failed to get customers', error.message));
  }
};

// Update liquidity status
exports.updateLiquidityStatus = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { cashOnHand, predictedDemand } = req.body;

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json(errorResponse('Agent not found'));
    }

    if (cashOnHand !== undefined) {
      agent.liquidityStatus.cashOnHand = cashOnHand;
    }
    if (predictedDemand) {
      agent.liquidityStatus.predictedDemand = predictedDemand;
    }
    agent.liquidityStatus.lastUpdated = new Date();

    await agent.save();

    res.status(200).json(successResponse({
      liquidityStatus: agent.liquidityStatus
    }, 'Liquidity status updated'));

  } catch (error) {
    console.error('Update liquidity error:', error);
    res.status(500).json(errorResponse('Failed to update liquidity', error.message));
  }
};

// Get all agents (admin only)
exports.getAllAgents = async (req, res) => {
  try {
    const { page = 1, limit = 10, level, isActive } = req.query;

    const { skip, limit: pageLimit } = paginate(page, limit);

    const filter = {};
    if (level) filter.agentLevel = level;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const agents = await Agent.find(filter)
      .select('-passwordHash')
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    const total = await Agent.countDocuments(filter);

    res.status(200).json(successResponse({
      agents,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / pageLimit)
      }
    }, 'Agents retrieved successfully'));

  } catch (error) {
    console.error('Get all agents error:', error);
    res.status(500).json(errorResponse('Failed to get agents', error.message));
  }
};

module.exports = exports;
