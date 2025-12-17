const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  // Business Information
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  businessType: {
    type: String,
    enum: ['retail', 'restaurant', 'supermarket', 'pharmacy', 'electronics', 'fashion', 'services', 'other'],
    required: true
  },
  rcNumber: {
    type: String,
    trim: true
  },
  
  // Owner Information
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
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
  
  // Business Location
  address: {
    street: String,
    city: String,
    state: String,
    lga: String
  },
  
  // Merchant ID
  merchantId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Password Hash
  passwordHash: {
    type: String,
    required: true
  },
  
  // POS Devices
  posDevices: [{
    deviceId: String,
    serialNumber: String,
    isActive: Boolean,
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    lastUsed: Date
  }],
  
  // Financial Data
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalTransactions: {
    type: Number,
    default: 0
  },
  
  // Credit AI Data
  creditScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  loanApplications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan'
  }],
  
  // Sales Analytics for Credit AI
  salesAnalytics: {
    last30Days: { type: Number, default: 0 },
    last60Days: { type: Number, default: 0 },
    last90Days: { type: Number, default: 0 },
    averageDailySales: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 0 },
    monthlyGrowth: { type: Number, default: 0 },
    averageTransactionValue: { type: Number, default: 0 },
    successfulTransactions: { type: Number, default: 0 },
    refundedTransactions: { type: Number, default: 0 }
  },
  
  // Staff Management
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  
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
  
  // Commission Rate
  commissionRate: {
    type: Number,
    default: 1.5, // 1.5% per transaction
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

// Virtual for calculating creditworthiness
merchantSchema.virtual('creditworthiness').get(function() {
  const { successfulTransactions, refundedTransactions } = this.salesAnalytics;
  if (successfulTransactions === 0) return 0;
  return ((successfulTransactions - refundedTransactions) / successfulTransactions) * 100;
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
