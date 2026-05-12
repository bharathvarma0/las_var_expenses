const jwt = require('jsonwebtoken');

// Secret key for JWT - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Authentication middleware
 * Validates JWT token and attaches user info to request
 */
function authenticateToken(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.auth = {
      userIds: decoded.userIds, // Array of user IDs this token can access
      groupName: decoded.groupName
    };

    next();
  });
}

/**
 * Validates that the requested userId is accessible by the authenticated user
 */
function validateUserAccess(req, res, next) {
  const requestedUserId = parseInt(req.params.userId || req.body.user_id);

  if (!requestedUserId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  if (!req.auth.userIds.includes(requestedUserId)) {
    return res.status(403).json({ error: 'Access denied to this user\'s data' });
  }

  next();
}

/**
 * Generates JWT token for access group
 */
function generateToken(userIds, groupName) {
  return jwt.sign(
    { userIds, groupName },
    JWT_SECRET,
    { expiresIn: '7d' } // Token valid for 7 days
  );
}

module.exports = {
  authenticateToken,
  validateUserAccess,
  generateToken,
  JWT_SECRET
};
