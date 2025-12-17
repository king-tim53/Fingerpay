const crypto = require('crypto');

// Generate unique IDs
const generateAgentId = () => {
  const prefix = 'AG';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

const generateCustomerId = () => {
  const prefix = 'CU';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

const generateMerchantId = () => {
  const prefix = 'MC';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

const generateTransactionId = () => {
  const prefix = 'TXN';
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
};

const generateDeviceId = () => {
  const prefix = 'POS';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Hash biometric data
const hashBiometric = (biometricData) => {
  return crypto.createHash('sha256').update(biometricData).digest('hex');
};

// Verify biometric hash
const verifyBiometric = (providedData, storedHash) => {
  const providedHash = hashBiometric(providedData);
  return providedHash === storedHash;
};

// Format response
const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

const errorResponse = (message, error = null) => {
  const response = {
    success: false,
    message
  };
  
  if (error) {
    response.error = error;
  }
  
  return response;
};

// Calculate transaction fee
const calculateTransactionFee = (amount, feePercentage = 0.5) => {
  const fee = (amount * feePercentage) / 100;
  return Math.round(fee * 100) / 100; // Round to 2 decimal places
};

// Calculate agent level based on registrations
const calculateAgentLevel = (totalRegistrations) => {
  if (totalRegistrations >= 1000) return 'AG-LV5';
  if (totalRegistrations >= 500) return 'AG-LV4';
  if (totalRegistrations >= 200) return 'AG-LV3';
  if (totalRegistrations >= 50) return 'AG-LV2';
  return 'AG-LV1';
};

// Calculate credit score (simple algorithm)
const calculateCreditScore = (salesData) => {
  const {
    averageDailySales = 0,
    consistencyScore = 0,
    totalTransactions = 0,
    monthlyGrowth = 0
  } = salesData;

  let score = 0;

  // Average daily sales (0-30 points)
  if (averageDailySales > 100000) score += 30;
  else if (averageDailySales > 50000) score += 20;
  else if (averageDailySales > 20000) score += 10;

  // Consistency (0-30 points)
  score += consistencyScore * 0.3;

  // Transaction volume (0-20 points)
  if (totalTransactions > 1000) score += 20;
  else if (totalTransactions > 500) score += 15;
  else if (totalTransactions > 100) score += 10;

  // Growth rate (0-20 points)
  if (monthlyGrowth > 20) score += 20;
  else if (monthlyGrowth > 10) score += 15;
  else if (monthlyGrowth > 5) score += 10;

  return Math.min(Math.round(score), 100);
};

// Paginate results
const paginate = (page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return {
    skip,
    limit: parseInt(limit)
  };
};

module.exports = {
  generateAgentId,
  generateCustomerId,
  generateMerchantId,
  generateTransactionId,
  generateDeviceId,
  hashBiometric,
  verifyBiometric,
  successResponse,
  errorResponse,
  calculateTransactionFee,
  calculateAgentLevel,
  calculateCreditScore,
  paginate
};
