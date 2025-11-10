// =====================================================

// backend/src/middleware/roleCheck.js
const { ForbiddenError } = require('../utils/errorTypes');

const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

module.exports = roleCheck;
