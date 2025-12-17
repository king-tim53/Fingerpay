# Quick Start Guide - FingerPay API Integration

## 🚀 Getting Started in 3 Steps

### Step 1: Start Your Backend
```bash
cd backend
npm install
npm start
```
Backend should be running on `http://localhost:3000`

### Step 2: Open Frontend
Open any HTML file in your browser. The API is already integrated in:
- ✅ `log.html` - Login/Registration page
- ✅ `agent.html` - Agent registration page
- ✅ `merchant.html` - Merchant registration page

### Step 3: Test It Out
1. Open `log.html` in your browser
2. Open browser console (F12)
3. Try to register or login
4. Watch the API calls in Network tab

## 📝 Quick Examples

### Check if API is Working
Open browser console on any page with the API scripts loaded:

```javascript
// Test API connection
FingerPayAPI.health.check().then(console.log);
// Should return: {success: true, message: "FingerPay API is running", ...}

// Check API version
FingerPayAPI.health.version().then(console.log);
// Should return: {success: true, version: "1.0.0", ...}
```

### Login Example
```javascript
// Agent login
FingerPayAPI.agent.login({
    email: 'agent@test.com',
    password: 'password123'
}).then(response => {
    console.log('Login successful!', response);
    FingerPayAPI.auth.setToken(response.token, true);
}).catch(error => {
    console.error('Login failed:', error.message);
});
```

### Register Example
```javascript
// Register new agent
FingerPayAPI.agent.register({
    name: 'John Doe',
    email: 'john@test.com',
    phone: '08012345678',
    password: 'securePass123',
    address: '123 Main St',
    location: { state: 'Lagos', lga: 'Ikeja' },
    idType: 'NIN',
    idNumber: '12345678901',
    bvn: '22222222222'
}).then(response => {
    console.log('Registration successful!', response);
}).catch(error => {
    console.error('Registration failed:', error.message);
});
```

## 🔧 Adding API to a New Page

### 1. Add Scripts to HTML
```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Page</title>
</head>
<body>
    <!-- Your content -->
    
    <!-- Add these scripts at the end -->
    <script src="config.js"></script>
    <script src="api.js"></script>
    <script src="your-script.js"></script>
</body>
</html>
```

### 2. Use API in Your Script
```javascript
// your-script.js
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!FingerPayAPI.auth.isAuthenticated()) {
        window.location.href = 'log.html';
        return;
    }
    
    // Use the API
    try {
        const dashboard = await FingerPayAPI.agent.getDashboard();
        console.log('Dashboard loaded:', dashboard);
        
        // Update UI with data
        document.getElementById('earnings').textContent = dashboard.stats.totalEarnings;
    } catch (error) {
        console.error('Error:', error);
    }
});
```

## 🎯 Common Use Cases

### Use Case 1: Login Form
```javascript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    try {
        const response = await FingerPayAPI.agent.login({ email, password });
        FingerPayAPI.auth.setToken(response.token, true);
        localStorage.setItem('userType', 'agent');
        window.location.href = 'agentDB.html';
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});
```

### Use Case 2: Load Dashboard Data
```javascript
async function loadDashboard() {
    try {
        const data = await FingerPayAPI.agent.getDashboard();
        
        // Update UI
        document.getElementById('totalEarnings').textContent = 
            '₦' + data.stats.totalEarnings.toLocaleString();
        document.getElementById('totalRegistrations').textContent = 
            data.stats.totalRegistrations;
            
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}
```

### Use Case 3: Submit Form Data
```javascript
async function enrollCustomer(formData) {
    try {
        const response = await FingerPayAPI.customer.enroll({
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            // ... other fields
        });
        
        alert('Customer enrolled successfully!');
        loadCustomerList(); // Refresh list
        
    } catch (error) {
        alert('Enrollment failed: ' + error.message);
    }
}
```

### Use Case 4: Check Authentication
```javascript
// At the top of protected pages
document.addEventListener('DOMContentLoaded', () => {
    if (!FingerPayAPI.auth.isAuthenticated()) {
        alert('Please login first');
        window.location.href = 'log.html';
        return;
    }
    
    // Continue with page logic
    initializePage();
});
```

## 🐛 Debugging Tips

### Problem: API not defined
**Solution**: Make sure scripts are in correct order:
```html
<script src="config.js"></script>  <!-- FIRST -->
<script src="api.js"></script>     <!-- SECOND -->
<script src="your-script.js"></script> <!-- THIRD -->
```

### Problem: CORS errors
**Solution**: Make sure backend has CORS enabled and allows your origin.

### Problem: 401 Unauthorized
**Solution**: Check if token is valid:
```javascript
console.log('Token:', FingerPayAPI.auth.getToken());
// If null, user needs to login again
```

### Problem: Network error
**Solution**: Check if backend is running:
```bash
cd backend
npm start
```

## 📚 More Information

- **Complete Guide**: See `API-INTEGRATION-GUIDE.md`
- **Full Example**: See `agentDB-api-example.js`
- **API Reference**: See `API-INTEGRATION-SUMMARY.md`

## ✅ Checklist

Before deploying:
- [ ] Backend is running
- [ ] Scripts are included in HTML
- [ ] Scripts are in correct order
- [ ] Production URL is configured in `config.js`
- [ ] CORS is properly configured
- [ ] Tested login/registration
- [ ] Tested error handling
- [ ] Tested on different browsers

## 🎉 You're Ready!

The API is now fully integrated into your frontend. You can:
- Login and register users
- Make authenticated API calls
- Handle errors gracefully
- Manage user sessions

For detailed examples and all available methods, check the other documentation files!
