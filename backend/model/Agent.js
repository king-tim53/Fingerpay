const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[0-9]{11}$/, 'Please provide a valid 11-digit phone number']
  },
  
  // Agent ID
  agentId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Password Hash
  passwordHash: {
    type: String,
    required: true
  },
  
  // Location Data
  location: {
    street: String,
    city: String,
    state: String,
    lga: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Agent Level (Based on performance)
  agentLevel: {
    type: String,
    enum: ['AG-LV1', 'AG-LV2', 'AG-LV3', 'AG-LV4', 'AG-LV5'],
    default: 'AG-LV1'
  },
  
  // Performance Metrics
  performance: {
    totalRegistrations: { type: Number, default: 0 },
    monthlyRegistrations: { type: Number, default: 0 },
    weeklyRegistrations: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    monthlyEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 }
  },
  
  // Commission Structure
  commissionRate: {
    registrationFee: { type: Number, default: 500 }, // ₦500 per registration
    transactionPercentage: { type: Number, default: 0.5 } // 0.5% of transactions in their area
  },
  
  // Wallet
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Customers Enrolled by this Agent
  customersEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  
  // Liquidity Management (Cash on Hand)
  liquidityStatus: {
    cashOnHand: { type: Number, default: 0 },
    predictedDemand: { 
      type: String, 
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    lastUpdated: Date
  },
  
  // Work Schedule
  workingHours: {
    monday: { start: String, end: String, isWorking: Boolean },
    tuesday: { start: String, end: String, isWorking: Boolean },
    wednesday: { start: String, end: String, isWorking: Boolean },
    thursday: { start: String, end: String, isWorking: Boolean },
    friday: { start: String, end: String, isWorking: Boolean },
    saturday: { start: String, end: String, isWorking: Boolean },
    sunday: { start: String, end: String, isWorking: Boolean }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  
  // Language Support
  languages: [{
    type: String,
    enum: ['english', 'pidgin', 'yoruba', 'igbo', 'hausa']
  }],
  
  // Equipment
  equipment: {
    scannerSerialNumber: String,
    tabletId: String,
    hasActiveEquipment: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Method to calculate agent level based on registrations
agentSchema.methods.calculateAgentLevel = function() {
  const registrations = this.performance.totalRegistrations;
  
  if (registrations >= 1000) return 'AG-LV5';
  if (registrations >= 500) return 'AG-LV4';
  if (registrations >= 250) return 'AG-LV3';
  if (registrations >= 100) return 'AG-LV2';
  return 'AG-LV1';
};

// Update commission rate based on level
agentSchema.methods.updateCommissionRate = function() {
  const levelRates = {
    'AG-LV1': { registrationFee: 500, transactionPercentage: 0.5 },
    'AG-LV2': { registrationFee: 600, transactionPercentage: 0.6 },
    'AG-LV3': { registrationFee: 750, transactionPercentage: 0.7 },
    'AG-LV4': { registrationFee: 900, transactionPercentage: 0.8 },
    'AG-LV5': { registrationFee: 1000, transactionPercentage: 1.0 }
  };
  
  this.commissionRate = levelRates[this.agentLevel];
};

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;
