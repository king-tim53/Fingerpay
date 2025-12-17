const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Transaction ID
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Transaction Type
  transactionType: {
    type: String,
    enum: ['payment', 'withdrawal', 'transfer', 'vault_deposit', 'vault_withdrawal', 'airtime', 'data', 'bills'],
    required: true
  },
  
  // Parties Involved
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant'
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  
  // Financial Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  fee: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Biometric Verification
  fingerUsed: {
    type: String,
    enum: ['left_thumb', 'left_index', 'left_middle', 'left_ring', 'left_pinky',
           'right_thumb', 'right_index', 'right_middle', 'right_ring', 'right_pinky']
  },
  isPanicTransaction: {
    type: Boolean,
    default: false
  },
  
  // Transaction Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'pending'
  },
  
  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['biometric', 'offline_token'],
    default: 'biometric'
  },
  
  // Location Data
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  
  // Device Information
  deviceId: String,
  
  // Description
  description: String,
  
  // Metadata
  metadata: {
    bankName: String,
    accountNumber: String,
    reference: String
  },
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  
  // Security Alerts
  securityAlert: {
    isAlerted: { type: Boolean, default: false },
    alertType: String,
    alertedAt: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
transactionSchema.index({ customer: 1, createdAt: -1 });
transactionSchema.index({ merchant: 1, createdAt: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ status: 1 });

// Method to generate transaction ID
transactionSchema.statics.generateTransactionId = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `FP${timestamp}${random}`.toUpperCase();
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
