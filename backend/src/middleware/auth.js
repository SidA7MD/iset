// backend/src/middleware/auth.js
const tokenManager = require('../utils/tokenManager');
const { UnauthorizedError } = require('../utils/errorTypes');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = tokenManager.verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError(error.message));
  }
};

module.exports = auth;
