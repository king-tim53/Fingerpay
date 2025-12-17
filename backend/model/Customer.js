const mongoose = require('mongoose');
const crypto = require('crypto');

const customerSchema = new mongoose.Schema({
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
  
  // Biometric Data (Finger ID)
  fingerId: {
    type: String,
    required: true,
    unique: true,
    // This will be a SHA-256 hash of the biometric template
  },
  
  // Finger Mapping (which finger maps to which bank)
  fingerMapping: [{
    fingerName: {
      type: String,
      enum: ['left_thumb', 'left_index', 'left_middle', 'left_ring', 'left_pinky',
             'right_thumb', 'right_index', 'right_middle', 'right_ring', 'right_pinky']
    },
    bankName: String,
    accountNumber: String,
    fingerHash: String, // Individual finger hash for verification
    isPanicFinger: { type: Boolean, default: false },
    isVaultFinger: { type: Boolean, default: false }
  }],
  
  // Financial Data
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  vaultBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Transaction History
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  
  // Security Settings
  panicFinger: {
    type: String,
    enum: ['left_pinky', 'right_pinky'],
    default: 'left_pinky'
  },
  vaultFinger: {
    type: String,
    enum: ['left_ring', 'right_ring'],
    default: 'right_ring'
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
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  
  // AI Preferences
  aiLanguagePreference: {
    type: String,
    enum: ['english', 'pidgin', 'yoruba', 'igbo', 'hausa'],
    default: 'english'
  },
  
  // Budget Settings for FinCoach AI
  monthlyBudget: {
    type: Number,
    default: 0
  },
  spendingAlerts: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to hash biometric data
customerSchema.methods.hashBiometricData = function(biometricData) {
  return crypto.createHash('sha256').update(biometricData).digest('hex');
};

// Method to verify biometric
customerSchema.methods.verifyBiometric = function(biometricData, fingerHash) {
  const hash = this.hashBiometricData(biometricData);
  return hash === fingerHash;
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
