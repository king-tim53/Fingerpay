/**
 * FingerPay API Client
 * Centralized API consumption for all backend endpoints
 */

// Get API base URL from config
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:3000/api';

console.log(API_BASE_URL);
/**
 * Helper function to get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

/**
 * Helper function to set auth token
 */
const setAuthToken = (token, remember = false) => {
  if (remember) {
    localStorage.setItem('authToken', token);
  } else {
    sessionStorage.setItem('authToken', token);
  }
};

/**
 * Helper function to remove auth token
 */
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
};

/**
 * Generic API request handler
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Request failed',
        data: data
      };
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * API Client Object
 */
const API = {
  // ========== GENERAL ==========
  health: {
    check: () => apiRequest('/health'),
    version: () => apiRequest('/version'),
  },

  // ========== AGENT APIs ==========
  agent: {
    // Auth
    register: (data) => apiRequest('/agents/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    login: (credentials) => apiRequest('/agents/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

    // Profile
    getProfile: () => apiRequest('/agents/profile'),
    
    updateProfile: (data) => apiRequest('/agents/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    // Dashboard
    getDashboard: () => apiRequest('/agents/dashboard'),
    
    getEnrolledCustomers: () => apiRequest('/agents/customers'),
    
    updateLiquidityStatus: (status) => apiRequest('/agents/liquidity', {
      method: 'PUT',
      body: JSON.stringify(status),
    }),

    // Admin
    getAll: () => apiRequest('/agents/all'),
  },

  // ========== CUSTOMER APIs ==========
  customer: {
    // Auth
    register: (data) => apiRequest('/customers/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    login: (credentials) => apiRequest('/customers/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

    // Enrollment (by agent)
    enroll: (data) => apiRequest('/customers/enroll', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    // Profile
    getProfile: (customerId) => apiRequest(`/customers/${customerId}`),
    
    updateProfile: (customerId, data) => apiRequest(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    // Biometric
    addFingerMapping: (customerId, data) => apiRequest(`/customers/${customerId}/finger-mapping`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    verifyBiometric: (customerId, biometricData) => apiRequest(`/customers/${customerId}/verify`, {
      method: 'POST',
      body: JSON.stringify(biometricData),
    }),

    // Transactions
    getTransactions: (customerId) => apiRequest(`/customers/${customerId}/transactions`),

    // Vault Operations
    vaultDeposit: (customerId, data) => apiRequest(`/customers/${customerId}/vault/deposit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    vaultWithdraw: (customerId, data) => apiRequest(`/customers/${customerId}/vault/withdraw`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    // Admin
    getAll: () => apiRequest('/customers'),
  },

  // ========== MERCHANT APIs ==========
  merchant: {
    // Auth
    register: (data) => apiRequest('/merchants/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    login: (credentials) => apiRequest('/merchants/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

    // Profile
    getProfile: () => apiRequest('/merchants/profile'),
    
    updateProfile: (data) => apiRequest('/merchants/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    // Dashboard
    getDashboard: () => apiRequest('/merchants/dashboard'),
    
    getTransactions: () => apiRequest('/merchants/transactions'),

    // POS Devices
    addPOSDevice: (data) => apiRequest('/merchants/pos-devices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    updatePOSDevice: (deviceId, data) => apiRequest(`/merchants/pos-devices/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    // Credit Score
    updateCreditScore: (data) => apiRequest('/merchants/credit-score', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    // Admin
    getAll: () => apiRequest('/merchants/all'),
  },

  // ========== TRANSACTION APIs ==========
  transaction: {
    // Transaction Operations
    initiate: (data) => apiRequest('/transactions/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    complete: (transactionId, data) => apiRequest(`/transactions/${transactionId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    reverse: (transactionId, data) => apiRequest(`/transactions/${transactionId}/reverse`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    getById: (transactionId) => apiRequest(`/transactions/${transactionId}`),

    // Admin/Reporting
    getAll: () => apiRequest('/transactions'),
    
    getStats: () => apiRequest('/transactions/stats/summary'),
  },

  // ========== AUTH HELPERS ==========
  auth: {
    setToken: setAuthToken,
    getToken: getAuthToken,
    removeToken: removeAuthToken,
    
    logout: () => {
      removeAuthToken();
      // Clear any other stored user data
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      sessionStorage.clear();
    },
    
    isAuthenticated: () => {
      return !!getAuthToken();
    },
  },
};

// Export API object
window.FingerPayAPI = API;

// Also export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
