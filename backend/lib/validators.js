// Validation helper functions

const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{11}$/;
  return phoneRegex.test(phone);
};

const validateAmount = (amount) => {
  return typeof amount === 'number' && amount >= 0;
};

const validateFingerName = (fingerName) => {
  const validFingers = [
    'left_thumb', 'left_index', 'left_middle', 'left_ring', 'left_pinky',
    'right_thumb', 'right_index', 'right_middle', 'right_ring', 'right_pinky'
  ];
  return validFingers.includes(fingerName);
};

const validateTransactionType = (type) => {
  const validTypes = ['payment', 'withdrawal', 'transfer', 'vault_deposit', 'vault_withdrawal', 'airtime', 'data', 'bills'];
  return validTypes.includes(type);
};

// Validate required fields
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!data[field] || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

module.exports = {
  validateEmail,
  validatePhone,
  validateAmount,
  validateFingerName,
  validateTransactionType,
  validateRequiredFields
};
