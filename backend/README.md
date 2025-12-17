# FingerPay Backend API

A robust Node.js/Express API for the FingerPay biometric payment system. This backend handles agent, merchant, and customer management, along with biometric authentication and transaction processing.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality

- **Multi-User System**: Agents, Merchants, and Customers with role-based access control
- **Biometric Authentication**: Fingerprint-based authentication and transaction authorization
- **Agent Management**: Agent registration, performance tracking, commission calculation
- **Merchant Management**: Business registration, POS device management, transaction tracking
- **Customer Management**: Customer enrollment, biometric mapping, vault operations
- **Transaction Processing**: Secure transaction initiation, completion, and reversal
- **Financial Operations**: Balance management, vault deposits/withdrawals, commission tracking

### Security Features

- JWT-based authentication
- Password and biometric data hashing
- Role-based access control (RBAC)
- Input validation and sanitization
- Secure error handling

## 🛠 Tech Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for hashing
- **Utilities**:
  - dotenv for environment variables
  - morgan for logging
  - cors for cross-origin requests

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB Atlas Account** - Free tier available at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/king-tim53/Fingerpay.git
cd Fingerpay/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MongoDB Atlas (Cloud Database)

This project uses **MongoDB Atlas** as the online database solution.

**Steps:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account (if you don't have one)
3. Create a new cluster (Free M0 tier available)
4. Wait for cluster deployment (2-5 minutes)
5. Click "Connect" → "Connect your application"
6. Copy the connection string
7. Save it for the next step (Configuration)

**Important:** Make sure to:

- Whitelist your IP address (Network Access)
- Create a database user (Database Access)
- Replace `<password>` in connection string with your database user password

## ⚙️ Configuration

### 1. Create Environment File

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (MongoDB Atlas)
DB_CONNECT_LINK=mongodb+srv://username:password@cluster.mongodb.net/fingerpay?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=*

# API Configuration
API_VERSION=1.0.0
```

### Environment Variables Explained

| Variable          | Description                          | Default           | Required |
| ----------------- | ------------------------------------ | ----------------- | -------- |
| `PORT`            | Port number for the server           | 3000              | No       |
| `NODE_ENV`        | Environment (development/production) | development       | No       |
| `DB_CONNECT_LINK` | MongoDB Atlas connection string      | mongodb+srv://... | Yes      |
| `JWT_SECRET`      | Secret key for JWT tokens            | -                 | Yes      |
| `CORS_ORIGIN`     | Allowed CORS origins                 | \*                | No       |
| `API_VERSION`     | API version number                   | 1.0.0             | No       |

### 3. Database Setup (MongoDB Atlas)

This project uses **MongoDB Atlas** as the cloud database solution. No local MongoDB installation required!

**Get Your Connection String:**

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Click "Connect" button
4. Choose "Connect your application"
5. Select **Node.js** driver and version **4.1 or later**
6. Copy the connection string (looks like this):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

**Update Your .env File:**

```env
DB_CONNECT_LINK=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/fingerpay?retryWrites=true&w=majority
```

**Important Notes:**

- Replace `your-username` with your MongoDB Atlas database username
- Replace `your-password` with your database user password (not your Atlas account password)
- Add `/fingerpay` before the `?` to specify the database name
- Make sure to whitelist your IP address in Atlas (Network Access)
- For production, whitelist specific IPs instead of allowing all (0.0.0.0/0)

**Example:**

```env
DB_CONNECT_LINK=mongodb+srv://fingerpay-admin:MySecureP@ss123@cluster0.abcde.mongodb.net/fingerpay?retryWrites=true&w=majority
```

### Why MongoDB Atlas?

✅ **No Local Installation Required** - No need to install MongoDB on your machine  
✅ **Always Available** - 99.995% uptime SLA  
✅ **Automatic Backups** - Daily backups included in free tier  
✅ **Built-in Security** - Encryption at rest and in transit  
✅ **Global Distribution** - Deploy in multiple regions  
✅ **Free Tier Available** - 512MB storage, perfect for development  
✅ **Easy Scaling** - Upgrade as your app grows  
✅ **Monitoring Dashboard** - Real-time performance metrics

## 🏃 Running the Application

### Development Mode

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT)

### Production Mode

```bash
NODE_ENV=production npm start
```

### With Nodemon (Auto-restart)

```bash
npm install -g nodemon
nodemon server.js
```

## 📡 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Health Check Endpoints

#### Check API Health

```http
GET /api/health
```

**Response:**

```json
{
  "success": true,
  "message": "FingerPay API is running",
  "version": "1.0.0",
  "timestamp": "2025-12-17T10:30:00.000Z"
}
```

#### Check API Version

```http
GET /api/version
```

### Authentication Endpoints

All endpoints return a JWT token upon successful authentication.

#### Agent Registration

```http
POST /api/agents/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "password": "securePassword123",
  "location": {
    "state": "Lagos",
    "lga": "Ikeja",
    "address": "123 Main St"
  },
  "idType": "NIN",
  "idNumber": "12345678901",
  "bvn": "22222222222"
}
```

#### Agent Login

```http
POST /api/agents/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Merchant Registration

```http
POST /api/merchants/register
Content-Type: application/json

{
  "businessName": "Shop XYZ",
  "businessType": "physical",
  "ownerName": "Jane Smith",
  "email": "shop@example.com",
  "phone": "08098765432",
  "password": "securePassword123",
  "address": "456 Market St",
  "rcNumber": "RC123456"
}
```

#### Customer Registration

```http
POST /api/customers/register
Content-Type: application/json

{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice@example.com",
  "phone": "08087654321",
  "password": "securePassword123"
}
```

### Protected Endpoints

Protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

#### Agent Dashboard

```http
GET /api/agents/dashboard
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRegistrations": 45,
      "monthlyRegistrations": 12,
      "totalEarnings": 450000,
      "monthlyEarnings": 120000,
      "balance": 350000,
      "liquidityBalance": 1000000
    },
    "chartData": {
      "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "registrations": [2, 3, 1, 4, 2, 0, 0],
      "earnings": [20000, 30000, 10000, 40000, 20000, 0, 0]
    }
  }
}
```

#### Get Enrolled Customers

```http
GET /api/agents/customers
Authorization: Bearer <token>
```

#### Merchant Dashboard

```http
GET /api/merchants/dashboard
Authorization: Bearer <token>
```

#### Get Merchant Transactions

```http
GET /api/merchants/transactions
Authorization: Bearer <token>
```

#### Initiate Transaction

```http
POST /api/transactions/initiate
Content-Type: application/json

{
  "customerId": "customer_id",
  "merchantId": "merchant_id",
  "amount": 5000,
  "type": "purchase",
  "biometricData": "fingerprint_hash"
}
```

### Complete API Reference

For a complete list of all endpoints, see [API Documentation](../frontend/API-INTEGRATION-GUIDE.md)

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection configuration
├── controller/
│   ├── agentController.js   # Agent business logic
│   ├── customerController.js # Customer business logic
│   ├── merchantController.js # Merchant business logic
│   └── transactionController.js # Transaction business logic
├── lib/
│   ├── auth.js              # JWT authentication middleware
│   ├── errorHandler.js      # Error handling utilities
│   ├── helpers.js           # Helper functions
│   └── validators.js        # Input validation functions
├── model/
│   ├── Agent.js             # Agent Mongoose schema
│   ├── Customer.js          # Customer Mongoose schema
│   ├── Merchant.js          # Merchant Mongoose schema
│   └── Transaction.js       # Transaction Mongoose schema
├── routes/
│   ├── index.js             # Main route aggregator
│   ├── agentRoutes.js       # Agent endpoints
│   ├── customerRoutes.js    # Customer endpoints
│   ├── merchantRoutes.js    # Merchant endpoints
│   └── transactionRoutes.js # Transaction endpoints
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── README.md                # This file
└── server.js                # Application entry point
```

## 🗄️ Database Models

### Agent Schema

```javascript
{
  agentId: String (unique),
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String (unique),
  passwordHash: String,
  location: {
    state: String,
    lga: String,
    address: String
  },
  performance: {
    totalRegistrations: Number,
    monthlyRegistrations: Number,
    totalEarnings: Number,
    monthlyEarnings: Number
  },
  balance: Number,
  liquidityBalance: Number,
  isActive: Boolean,
  createdAt: Date
}
```

### Customer Schema

```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String (unique),
  fingerId: String (hashed),
  fingerMapping: [{
    fingerName: String,
    bankName: String,
    accountNumber: String,
    fingerHash: String,
    isPanicFinger: Boolean,
    isVaultFinger: Boolean
  }],
  balance: Number,
  vaultBalance: Number,
  enrolledBy: ObjectId (ref: Agent),
  isActive: Boolean,
  isVerified: Boolean,
  enrollmentDate: Date
}
```

### Merchant Schema

```javascript
{
  merchantId: String (unique),
  businessName: String,
  businessType: String,
  ownerName: String,
  email: String (unique),
  phone: String (unique),
  passwordHash: String,
  address: String,
  posDevices: [{
    deviceId: String,
    deviceType: String,
    location: String,
    isActive: Boolean
  }],
  totalTransactions: Number,
  totalRevenue: Number,
  creditScore: Number,
  isActive: Boolean,
  registeredAt: Date
}
```

### Transaction Schema

```javascript
{
  transactionId: String (unique),
  customer: ObjectId (ref: Customer),
  merchant: ObjectId (ref: Merchant),
  agent: ObjectId (ref: Agent),
  amount: Number,
  transactionType: String,
  status: String,
  biometricVerified: Boolean,
  initiatedAt: Date,
  completedAt: Date
}
```

## 🔐 Authentication

### JWT Token Structure

Tokens contain the following payload:

```javascript
{
  id: "user_id",
  role: "agent|merchant|customer",
  iat: 1234567890,  // Issued at
  exp: 1234567890   // Expiration
}
```

### Generating Tokens

Tokens are automatically generated upon successful login/registration:

```javascript
const token = generateToken({
  id: user._id,
  role: "agent",
});
```

### Using Tokens

Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Protected Routes

Use the `authenticate` middleware with role checking:

```javascript
router.get("/profile", authenticate(["agent"]), agentController.getProfile);
```

## 🚨 Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes

| Code | Description                          |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request (validation errors)      |
| 401  | Unauthorized (invalid/missing token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 500  | Internal Server Error                |

### Error Examples

**Validation Error:**

```json
{
  "success": false,
  "message": "Missing required fields",
  "error": ["firstName", "lastName", "email"]
}
```

**Authentication Error:**

```json
{
  "success": false,
  "message": "An agent with this email already exists"
}
```

## 📊 API Testing

### Using cURL

```bash
# Register Agent
curl -X POST http://localhost:3000/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "08012345678",
    "password": "test123"
  }'

# Login
curl -X POST http://localhost:3000/api/agents/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "test123"
  }'

# Access Protected Route
curl -X GET http://localhost:3000/api/agents/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the API collection (if provided)
2. Set up environment variables:
   - `base_url`: `http://localhost:3000/api`
   - `token`: Your JWT token
3. Test endpoints

## 🐛 Debugging

### Enable Debug Logs

Set environment variable:

```bash
DEBUG=fingerpay:* npm start
```

### Common Issues

**1. MongoDB Atlas Connection Failed**

```
Error: Could not connect to any servers in your MongoDB Atlas cluster
```

**Solution**: Check these common issues:

1. **Whitelist your IP address**

   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Add your current IP or use 0.0.0.0/0 for all (development only)

2. **Verify database credentials**

   - Ensure username and password are correct
   - Password must be URL-encoded if it contains special characters
   - Example: `P@ssw0rd!` becomes `P%40ssw0rd%21`

3. **Check connection string format**

   ```env
   # Correct format:
   DB_CONNECT_LINK=mongodb+srv://username:password@cluster.mongodb.net/fingerpay?retryWrites=true&w=majority

   # Must include:
   # - mongodb+srv:// (not mongodb://)
   # - Database name (/fingerpay)
   # - Query parameters (?retryWrites=true&w=majority)
   ```

4. **Verify cluster is running**
   - Check MongoDB Atlas dashboard
   - Cluster should show "Active" status

**2. Authentication Failed to Atlas**

```
Error: bad auth : Authentication failed
```

**Solution**:

- Username/password in connection string doesn't match database user
- Go to Atlas → Database Access → Verify credentials
- Create new database user if needed
- Update `.env` with correct credentials

**3. Port Already in Use**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Change PORT in `.env` or kill the process

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill
```

**3. JWT Secret Missing**

```
Error: JWT secret not defined
```

**Solution**: Set `JWT_SECRET` in `.env`

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Always use `.env.example`
2. **Use strong JWT secrets** - Minimum 32 characters
3. **Enable HTTPS in production** - Use SSL/TLS certificates
4. **Implement rate limiting** - Prevent API abuse
5. **Validate all inputs** - Never trust user input
6. **Hash sensitive data** - Passwords, biometric data
7. **Use environment-specific configs** - Different settings for dev/prod

## 🚀 Deployment

### Prerequisites

- Node.js hosting (Heroku, DigitalOcean, AWS, etc.)
- MongoDB Atlas or hosted MongoDB

### Environment Setup

1. Set production environment variables
2. Use production database
3. Enable HTTPS
4. Set `NODE_ENV=production`

### Deployment Steps

**Heroku:**

```bash
heroku create fingerpay-api
heroku config:set JWT_SECRET=your_secret
heroku config:set DB_CONNECT_LINK=your_mongodb_atlas_connection_string
heroku config:set NODE_ENV=production
git push heroku main
```

**Note:** MongoDB Atlas works seamlessly with Heroku. Just use your Atlas connection string!

**DigitalOcean/AWS:**

```bash
# SSH into server
ssh user@your-server

# Clone repository
git clone https://github.com/king-tim53/Fingerpay.git
cd Fingerpay/backend

# Install dependencies
npm install

# Set up environment
nano .env

# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name fingerpay-api
pm2 save
pm2 startup
```

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
- Agent, Merchant, Customer management
- Biometric authentication
- Transaction processing
- Dashboard APIs
- JWT authentication
- Role-based access control
