# FingerPay Frontend API Integration Guide

This guide explains how to consume the backend API in your frontend application.

## Setup

### 1. Include Required Scripts

Add these scripts to your HTML files **in this order**:

```html
<!-- Before your page-specific scripts -->
<script src="config.js"></script>
<script src="api.js"></script>
<script src="your-page-script.js"></script>
```

### 2. Configure Environment

The `config.js` file automatically detects the environment:
- **Development**: Uses `http://localhost:3000/api` when running on localhost
- **Production**: Uses your production API URL

To change the production URL, edit `config.js`:

```javascript
production: {
  API_BASE_URL: 'https://your-production-domain.com/api'
}
```

## Usage Examples

### Authentication

#### Agent Login
```javascript
try {
  const response = await FingerPayAPI.agent.login({
    email: 'agent@example.com',
    password: 'password123'
  });
  
  // Store token
  FingerPayAPI.auth.setToken(response.token, true); // true = remember me
  
  // Store user info
  localStorage.setItem('userType', 'agent');
  localStorage.setItem('userId', response.agent.id);
  
  // Redirect to dashboard
  window.location.href = 'agentDB.html';
  
} catch (error) {
  console.error('Login failed:', error.message);
}
```

#### Agent Registration
```javascript
try {
  const response = await FingerPayAPI.agent.register({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '08012345678',
    password: 'securePassword123',
    address: '123 Main St',
    location: {
      state: 'Lagos',
      lga: 'Ikeja',
      address: '123 Main St'
    },
    idType: 'NIN',
    idNumber: '12345678901',
    bvn: '22222222222'
  });
  
  // Auto-login after registration
  FingerPayAPI.auth.setToken(response.token, true);
  
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

#### Merchant Login
```javascript
const response = await FingerPayAPI.merchant.login({
  email: 'merchant@shop.com',
  password: 'password123'
});
```

#### Customer Login
```javascript
const response = await FingerPayAPI.customer.login({
  phone: '08012345678',
  password: 'password123'
});
```

#### Logout
```javascript
FingerPayAPI.auth.logout(); // Clears all tokens and user data
window.location.href = 'log.html';
```

### Agent Operations

#### Get Agent Dashboard
```javascript
try {
  const dashboard = await FingerPayAPI.agent.getDashboard();
  
  console.log(dashboard.stats.totalRegistrations);
  console.log(dashboard.stats.totalEarnings);
  console.log(dashboard.stats.liquidityBalance);
  
} catch (error) {
  console.error('Failed to load dashboard:', error);
}
```

#### Get Agent Profile
```javascript
const profile = await FingerPayAPI.agent.getProfile();
console.log(profile.data.name);
console.log(profile.data.email);
```

#### Update Agent Profile
```javascript
await FingerPayAPI.agent.updateProfile({
  name: 'Updated Name',
  phone: '08098765432',
  address: 'New Address'
});
```

#### Get Enrolled Customers
```javascript
const customers = await FingerPayAPI.agent.getEnrolledCustomers();
customers.data.forEach(customer => {
  console.log(customer.name, customer.phone);
});
```

#### Update Liquidity Status
```javascript
await FingerPayAPI.agent.updateLiquidityStatus({
  amount: 50000,
  action: 'add' // or 'withdraw'
});
```

### Customer Operations

#### Enroll Customer (by Agent)
```javascript
try {
  const response = await FingerPayAPI.customer.enroll({
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '08087654321',
    address: '456 Market St',
    idType: 'NIN',
    idNumber: '98765432109',
    bvn: '11111111111',
    biometricData: fingerprintScanData // From fingerprint device
  });
  
  console.log('Customer enrolled:', response.customer.id);
  
} catch (error) {
  console.error('Enrollment failed:', error);
}
```

#### Get Customer Profile
```javascript
const customerId = '123456789';
const profile = await FingerPayAPI.customer.getProfile(customerId);
```

#### Verify Biometric
```javascript
try {
  const result = await FingerPayAPI.customer.verifyBiometric(customerId, {
    biometricData: fingerprintScanData,
    fingerPosition: 'right_thumb'
  });
  
  if (result.verified) {
    console.log('Customer verified!');
  }
  
} catch (error) {
  console.error('Verification failed');
}
```

#### Vault Deposit
```javascript
await FingerPayAPI.customer.vaultDeposit(customerId, {
  amount: 10000,
  agentId: agentId
});
```

#### Vault Withdrawal
```javascript
await FingerPayAPI.customer.vaultWithdraw(customerId, {
  amount: 5000,
  agentId: agentId,
  biometricData: fingerprintScanData
});
```

#### Get Customer Transactions
```javascript
const transactions = await FingerPayAPI.customer.getTransactions(customerId);
transactions.data.forEach(txn => {
  console.log(txn.type, txn.amount, txn.status);
});
```

### Merchant Operations

#### Register Merchant
```javascript
await FingerPayAPI.merchant.register({
  name: 'Shop Name',
  businessName: 'Shop Name Ltd',
  email: 'shop@example.com',
  phone: '08011111111',
  password: 'password123',
  businessType: 'physical', // or 'online'
  address: '789 Business Ave',
  location: {
    state: 'Lagos',
    lga: 'Victoria Island'
  },
  idType: 'NIN',
  idNumber: '55555555555',
  cacNumber: 'RC123456'
});
```

#### Get Merchant Dashboard
```javascript
const dashboard = await FingerPayAPI.merchant.getDashboard();
console.log(dashboard.stats.totalTransactions);
console.log(dashboard.stats.totalRevenue);
```

#### Get Merchant Transactions
```javascript
const transactions = await FingerPayAPI.merchant.getTransactions();
```

#### Add POS Device
```javascript
await FingerPayAPI.merchant.addPOSDevice({
  deviceId: 'POS-001',
  deviceType: 'biometric',
  location: 'Shop Counter 1'
});
```

#### Update POS Device
```javascript
await FingerPayAPI.merchant.updatePOSDevice(deviceId, {
  status: 'active',
  location: 'New Location'
});
```

### Transaction Operations

#### Initiate Transaction
```javascript
try {
  const transaction = await FingerPayAPI.transaction.initiate({
    customerId: customerId,
    merchantId: merchantId,
    amount: 5000,
    type: 'purchase',
    biometricData: fingerprintScanData
  });
  
  console.log('Transaction ID:', transaction.transactionId);
  
} catch (error) {
  console.error('Transaction failed:', error);
}
```

#### Complete Transaction
```javascript
await FingerPayAPI.transaction.complete(transactionId, {
  status: 'completed',
  receiptNumber: 'RCP-12345'
});
```

#### Reverse Transaction
```javascript
await FingerPayAPI.transaction.reverse(transactionId, {
  reason: 'Customer request'
});
```

#### Get Transaction by ID
```javascript
const transaction = await FingerPayAPI.transaction.getById(transactionId);
console.log(transaction.amount);
console.log(transaction.status);
```

#### Get Transaction Statistics (Admin)
```javascript
const stats = await FingerPayAPI.transaction.getStats();
console.log(stats.totalTransactions);
console.log(stats.totalVolume);
```

### Health Check

```javascript
// Check API health
const health = await FingerPayAPI.health.check();
console.log(health.message);

// Check API version
const version = await FingerPayAPI.health.version();
console.log(version.version);
```

## Error Handling

All API calls return promises and should be wrapped in try-catch blocks:

```javascript
try {
  const response = await FingerPayAPI.agent.getProfile();
  // Handle success
} catch (error) {
  console.error('API Error:', error);
  
  // Error object contains:
  // - error.status: HTTP status code
  // - error.message: Error message
  // - error.data: Additional error data
  
  if (error.status === 401) {
    // Unauthorized - redirect to login
    FingerPayAPI.auth.logout();
    window.location.href = 'log.html';
  } else {
    // Show error to user
    alert(error.message);
  }
}
```

## Authentication Check

Check if user is authenticated before accessing protected pages:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  if (!FingerPayAPI.auth.isAuthenticated()) {
    window.location.href = 'log.html';
    return;
  }
  
  // Check user type
  const userType = localStorage.getItem('userType');
  if (userType !== 'agent') {
    alert('Access denied');
    window.location.href = 'log.html';
    return;
  }
  
  // Continue with page logic
  loadDashboard();
});
```

## Complete Example: Agent Dashboard

See `agentDB-api-example.js` for a complete working example of:
- Authentication check
- Loading dashboard data
- Displaying customer list
- Handling forms with API integration
- Error handling
- Loading states

## Notes

1. **Authentication Token**: The token is automatically included in all API requests after login
2. **Remember Me**: Use `setToken(token, true)` to persist token in localStorage, `false` for sessionStorage only
3. **CORS**: Make sure your backend has proper CORS configuration for your frontend domain
4. **Environment**: The API automatically switches between development and production based on hostname
5. **Error Handling**: Always use try-catch blocks for API calls
6. **Loading States**: Show loading indicators during API calls for better UX

## API Reference

All available methods are in the `FingerPayAPI` object:

- `FingerPayAPI.health.*` - Health check endpoints
- `FingerPayAPI.agent.*` - Agent operations
- `FingerPayAPI.customer.*` - Customer operations
- `FingerPayAPI.merchant.*` - Merchant operations
- `FingerPayAPI.transaction.*` - Transaction operations
- `FingerPayAPI.auth.*` - Authentication helpers

## Support

For API issues, check:
1. Browser console for error messages
2. Network tab in DevTools to see request/response
3. Backend server logs
4. Make sure backend server is running on the correct port
