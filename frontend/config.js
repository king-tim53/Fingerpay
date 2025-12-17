// Environment Configuration
const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:8000/api'
  },
  production: {
    API_BASE_URL: 'https://fingerpay-api.onrender.com/api'
  }
};

// Determine current environment (default to development)
const CURRENT_ENV = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' 
                     ? 'development' 
                     : 'production';

// Export configuration
const config = {
  API_BASE_URL: ENV[CURRENT_ENV].API_BASE_URL,
  ENVIRONMENT: CURRENT_ENV
};

// Make config available globally
window.APP_CONFIG = config;
