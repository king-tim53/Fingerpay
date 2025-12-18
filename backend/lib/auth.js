const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key-change-this', {
    expiresIn
  });
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
  } catch (error) {
    return null;
  }
};

// Authentication Middleware
const authenticate = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Check if user role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: error.message
      });
    }
  };
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authenticateToken: authenticate([])
};
