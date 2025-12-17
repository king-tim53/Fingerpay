# FingerPay Frontend

A modern, responsive web application for the FingerPay biometric payment system. Built with vanilla JavaScript, Bootstrap 5, and Chart.js, providing intuitive interfaces for agents, merchants, and customers.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Pages Overview](#pages-overview)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Browser Support](#browser-support)

## ✨ Features

### Core Functionality

- **Multi-Language Support**: English, Pidgin, Yoruba, Igbo, Hausa
- **Role-Based Dashboards**: Separate interfaces for Agents, Merchants, and Customers
- **Real-Time Data**: Live updates from backend API
- **Biometric Integration Ready**: Fingerprint authentication interfaces
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Interactive Charts**: Data visualization with Chart.js
- **Form Validation**: Client-side validation with instant feedback

### User Interfaces

- **Agent Portal**: Registration tracking, customer management, earnings dashboard
- **Merchant Portal**: Transaction monitoring, POS management, sales analytics
- **Customer Portal**: Balance checking, transaction history, vault operations
- **Authentication**: Secure login/registration with JWT tokens

## 🛠 Tech Stack

- **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3.2
- **Icons**: Bootstrap Icons 1.11.1
- **Charts**: Chart.js
- **Fonts**: Google Fonts (Plus Jakarta Sans, Outfit)
- **API Communication**: Fetch API
- **State Management**: LocalStorage/SessionStorage

## 📦 Prerequisites

- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Backend API**: Running FingerPay backend (see backend README)
- **Web Server**: Any HTTP server (Live Server, nginx, Apache, etc.)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/king-tim53/Fingerpay.git
cd Fingerpay/frontend
```

### 2. No Build Step Required!

This is a vanilla JavaScript application - no npm install or build process needed!

### 3. Setup Backend Connection

The frontend connects to the backend API automatically based on environment:

- **Development**: `http://localhost:3000/api` (auto-detected)
- **Production**: Configure in `config.js`

## ⚙️ Configuration

### Environment Configuration

Edit `config.js` to set your API URLs:

```javascript
const ENV = {
  development: {
    API_BASE_URL: "http://localhost:3000/api",
  },
  production: {
    API_BASE_URL: "https://your-production-domain.com/api",
  },
};
```

### Environment Detection

The app automatically detects environment:

- **localhost/127.0.0.1** → Development mode
- **Any other domain** → Production mode

### Optional: Manual Override

Create `env.js` (optional) to override settings:

```javascript
// Load before config.js
window.ENV = {
  development: {
    API_BASE_URL: "http://localhost:8000/api",
  },
  production: {
    API_BASE_URL: "https://api.fingerpay.com/api",
  },
};
```

Then include in HTML:

```html
<script src="env.js"></script>
<script src="config.js"></script>
<script src="api.js"></script>
```

## 🏃 Running the Application

### Option 1: VS Code Live Server (Recommended)

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"
4. Opens at `http://localhost:5500`

### Option 2: Python HTTP Server

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Visit: `http://localhost:8000`

### Option 3: Node.js HTTP Server

```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```

Visit: `http://localhost:8000`

### Option 4: PHP Built-in Server

```bash
php -S localhost:8000
```

## 📁 Project Structure

```
frontend/
├── config.js                    # Environment configuration
├── api.js                       # API client (all endpoints)
├── index.html                   # Landing page
├── style2.css                   # Landing page styles
├── script2.js                   # Landing page scripts
│
├── Authentication/
│   ├── log.html                 # Login/Registration page
│   ├── log.css                  # Login styles
│   ├── log.js                   # Login logic with API integration
│   └── lang.js                  # Multi-language support
│
├── Agent Portal/
│   ├── agent.html               # Agent registration form
│   ├── agent.css                # Agent registration styles
│   ├── agent.js                 # Agent registration logic
│   ├── agDB.html                # Agent dashboard (main)
│   ├── agentDB.css              # Agent dashboard styles
│   ├── agentDB.js               # Agent dashboard logic
│   ├── agenpp.html              # Agent login (alternative)
│   └── agentpp.css              # Agent login styles
│
├── Merchant Portal/
│   ├── merchant.html            # Merchant registration form
│   ├── merchant.css             # Merchant registration styles
│   ├── merchant.js              # Merchant registration logic
│   ├── merchantDB.html          # Merchant dashboard
│   ├── merchantDB.css           # Merchant dashboard styles
│   ├── merchantDB.js            # Merchant dashboard logic
│   └── merchant-login.html      # Merchant login
│
├── Customer Portal/
│   ├── pack.html                # Customer packages/services
│   ├── pack.css                 # Package styles
│   ├── pack.js                  # Package logic
│   ├── pos.html                 # POS transaction interface
│   ├── pos.css                  # POS styles
│   └── pos.js                   # POS logic
│
├── Documentation/
│   ├── API-INTEGRATION-GUIDE.md # Complete API usage guide
│   ├── API-INTEGRATION-SUMMARY.md # API integration summary
│   ├── QUICK-START.md           # Quick start guide
│   ├── README.md                # This file
│   └── template-with-api.html   # HTML template example
│
└── Examples/
    └── agentDB-api-example.js   # Complete dashboard example
```

## 🔌 API Integration

### How It Works

The frontend uses a centralized API client (`api.js`) that handles all backend communication.

### Basic Usage

```javascript
// 1. Config is loaded first (config.js)
// 2. API client is initialized (api.js)
// 3. Your page script uses the API

// Example: Login
const response = await FingerPayAPI.agent.login({
  email: "agent@example.com",
  password: "password123",
});

// Store token
FingerPayAPI.auth.setToken(response.token, true);

// Get dashboard data
const dashboard = await FingerPayAPI.agent.getDashboard();
```

### Including API Scripts

Add these to your HTML (in order):

```html
<!-- At end of body, before your page scripts -->
<script src="config.js"></script>
<script src="api.js"></script>
<script src="your-page-script.js"></script>
```

### Available API Methods

```javascript
// Health Check
await FingerPayAPI.health.check();
await FingerPayAPI.health.version();

// Agent Operations
await FingerPayAPI.agent.register(data);
await FingerPayAPI.agent.login(credentials);
await FingerPayAPI.agent.getProfile();
await FingerPayAPI.agent.getDashboard();
await FingerPayAPI.agent.getEnrolledCustomers();

// Merchant Operations
await FingerPayAPI.merchant.register(data);
await FingerPayAPI.merchant.login(credentials);
await FingerPayAPI.merchant.getProfile();
await FingerPayAPI.merchant.getDashboard();
await FingerPayAPI.merchant.getTransactions();

// Customer Operations
await FingerPayAPI.customer.register(data);
await FingerPayAPI.customer.login(credentials);
await FingerPayAPI.customer.verifyBiometric(customerId, data);
await FingerPayAPI.customer.vaultDeposit(customerId, data);

// Transaction Operations
await FingerPayAPI.transaction.initiate(data);
await FingerPayAPI.transaction.complete(transactionId, data);

// Authentication
FingerPayAPI.auth.setToken(token, remember);
FingerPayAPI.auth.getToken();
FingerPayAPI.auth.isAuthenticated();
FingerPayAPI.auth.logout();
```

For complete API documentation, see [API-INTEGRATION-GUIDE.md](API-INTEGRATION-GUIDE.md)

## 📱 Pages Overview

### Landing Page (`index.html`)

- Hero section with key features
- Service offerings
- Benefits showcase
- Call-to-action for different user types

### Authentication (`log.html`)

- **Login**: Email/password authentication
- **Registration**: Multi-step user registration
- **Biometric Option**: Fingerprint login interface
- **Multi-Language**: 5 language options

### Agent Portal

**Registration (`agent.html`)**

- Personal information
- Business details
- ID verification
- Location details

**Dashboard (`agDB.html`)**

- Performance metrics (registrations, earnings)
- Customer list (enrolled customers)
- Transaction charts
- Commission tracking
- Liquidity management

**Features:**

- Real-time statistics
- Weekly/Monthly performance graphs
- Customer enrollment form
- Earnings breakdown

### Merchant Portal

**Registration (`merchant.html`)**

- Business information
- Owner details
- Business type (Physical/Online)
- Documentation upload

**Dashboard (`merchantDB.html`)**

- Sales overview
- Transaction history
- Revenue analytics
- POS device management
- Staff management
- Credit score tracking

**Features:**

- Real-time sales data
- Transaction filtering
- Device monitoring
- Performance reports

### Customer Portal

**Services (`pack.html`)**

- Service packages
- Feature comparison
- Pricing information
- Sign-up flow

**POS Interface (`pos.html`)**

- Transaction initiation
- Biometric verification
- Payment processing
- Receipt generation

## 🛠 Development Guide

### Adding a New Page

1. **Create HTML file**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>New Page | FingerPay</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link href="your-styles.css" rel="stylesheet" />
  </head>
  <body>
    <!-- Your content -->

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="config.js"></script>
    <script src="api.js"></script>
    <script src="your-script.js"></script>
  </body>
</html>
```

2. **Create JavaScript file**

```javascript
document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication
  if (!FingerPayAPI.auth.isAuthenticated()) {
    window.location.href = "log.html";
    return;
  }

  // Load data
  await loadPageData();
});

async function loadPageData() {
  try {
    const data = await FingerPayAPI.agent.getDashboard();
    updateUI(data);
  } catch (error) {
    console.error("Error:", error);
    alert(error.message);
  }
}
```

### Form Validation Example

```javascript
// HTML
<input type="text" id="name" name="name" required
       pattern=".*\s+.*"
       title="Please enter first and last name">

// JavaScript
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get('name');

    // Validate
    if (name.trim().split(/\s+/).length < 2) {
        alert('Please enter first and last name');
        return;
    }

    // Submit to API
    try {
        const response = await FingerPayAPI.agent.register({
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' ')
        });
        alert('Success!');
    } catch (error) {
        alert(error.message);
    }
});
```

### Error Handling

```javascript
try {
  const response = await FingerPayAPI.agent.login(credentials);
  // Handle success
} catch (error) {
  // Error object structure:
  // - error.status: HTTP status code
  // - error.message: Error message
  // - error.data: Additional data

  if (error.status === 401) {
    alert("Invalid credentials");
  } else if (error.status === 400) {
    alert(error.message);
  } else {
    alert("An error occurred. Please try again.");
  }
}
```

### Authentication Check

```javascript
// Add to every protected page
document.addEventListener("DOMContentLoaded", () => {
  // Check if logged in
  if (!FingerPayAPI.auth.isAuthenticated()) {
    window.location.href = "log.html";
    return;
  }

  // Check user type
  const userType = localStorage.getItem("userType");
  if (userType !== "agent") {
    alert("Access denied");
    window.location.href = "log.html";
    return;
  }

  // Continue with page logic
  initializePage();
});
```

### Loading States

```javascript
// Show loading
function showLoading() {
  const loader = document.getElementById("loader");
  loader.classList.remove("d-none");
}

// Hide loading
function hideLoading() {
  const loader = document.getElementById("loader");
  loader.classList.add("d-none");
}

// Usage
async function loadData() {
  showLoading();
  try {
    const data = await FingerPayAPI.agent.getDashboard();
    updateUI(data);
  } catch (error) {
    console.error(error);
  } finally {
    hideLoading();
  }
}
```

## 🚀 Deployment

### Prerequisites

- Web hosting (Netlify, Vercel, GitHub Pages, etc.)
- Backend API deployed and accessible

### Step 1: Update Configuration

Edit `config.js`:

```javascript
production: {
  API_BASE_URL: "https://api.yourdomain.com/api";
}
```

### Step 2: Test Production Build

1. Test with production API locally
2. Verify all API calls work
3. Check authentication flow
4. Test on different browsers

### Step 3: Deploy

**Option A: Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

**Option B: Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

**Option C: GitHub Pages**

```bash
# Push to GitHub
git add .
git commit -m "Deploy frontend"
git push origin main

# Enable GitHub Pages in repository settings
# Source: main branch / root or /docs folder
```

**Option D: Traditional Hosting**

1. Upload all files via FTP/SFTP
2. Configure web server (nginx/Apache)
3. Set up SSL certificate
4. Point domain to server

### Step 4: Configure HTTPS

Always use HTTPS in production:

- Netlify/Vercel: Automatic
- Custom server: Use Let's Encrypt

### Step 5: Update CORS

Ensure backend allows your domain:

```javascript
// Backend .env
CORS_ORIGIN=https://yourdomain.com
```

## 🌐 Browser Support

### Minimum Requirements

| Browser | Version |
| ------- | ------- |
| Chrome  | 90+     |
| Firefox | 88+     |
| Safari  | 14+     |
| Edge    | 90+     |
| Opera   | 76+     |

### Mobile Support

- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

### Features Used

- ES6+ JavaScript
- Fetch API
- LocalStorage
- CSS Grid & Flexbox
- CSS Custom Properties

## 📊 Performance Optimization

### Best Practices

1. **Minimize API Calls**

```javascript
// Cache dashboard data
let cachedData = null;
let cacheTime = null;

async function getDashboard() {
  const now = Date.now();
  if (cachedData && now - cacheTime < 60000) {
    return cachedData;
  }

  cachedData = await FingerPayAPI.agent.getDashboard();
  cacheTime = now;
  return cachedData;
}
```

2. **Lazy Load Images**

```html
<img src="placeholder.jpg" data-src="actual-image.jpg" loading="lazy" />
```

3. **Defer Non-Critical Scripts**

```html
<script src="analytics.js" defer></script>
```

## 🔒 Security Best Practices

1. **Never expose sensitive data**

```javascript
// ❌ Bad
console.log("Token:", token);

// ✅ Good
console.log("User authenticated");
```

2. **Validate all inputs**

```javascript
// Client-side validation
if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  alert("Invalid email");
  return;
}
```

3. **Use HTTPS in production**
4. **Sanitize user input**
5. **Implement CSRF protection**
6. **Set secure headers**

## 🐛 Troubleshooting

### API Connection Issues

**Problem**: `Failed to fetch`
**Solution**:

1. Check backend is running
2. Verify API URL in `config.js`
3. Check browser console for CORS errors
4. Verify network connectivity

### Authentication Issues

**Problem**: Token not working
**Solution**:

```javascript
// Check if token exists
console.log("Token:", FingerPayAPI.auth.getToken());

// Check if authenticated
console.log("Authenticated:", FingerPayAPI.auth.isAuthenticated());

// Re-login if needed
```

### Form Submission Issues

**Problem**: Form not submitting
**Solution**:

1. Check form has `name` attributes
2. Verify `e.preventDefault()` is called
3. Check browser console for errors
4. Validate form data structure

## 📚 Additional Resources

- [API Integration Guide](API-INTEGRATION-GUIDE.md)
- [Quick Start Guide](QUICK-START.md)
- [API Summary](API-INTEGRATION-SUMMARY.md)
- [Dashboard Example](agentDB-api-example.js)
- [Backend Documentation](../backend/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Contributors

- **King Tim** - Lead Developer

## 📞 Support

For issues and questions:

- Email: support@fingerpay.com
- GitHub Issues: [Create an issue](https://github.com/king-tim53/Fingerpay/issues)

## 🔄 Changelog

### Version 1.0.0 (December 2025)

- Initial release
- Multi-language support
- Agent, Merchant, Customer portals
- API integration with backend
- Biometric authentication UI
- Dashboard analytics
- Transaction processing
- Responsive design
- Form validation
- Authentication & authorization
