// =====================================================

// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const { TooManyRequestsError } = require('../utils/errorTypes');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    handler: (req, res, next) => {
      next(new TooManyRequestsError(message));
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiter
const apiLimiter = createLimiter(
  config.rateLimit.windowMs,
  config.rateLimit.maxRequests,
  'Too many requests from this IP, please try again later'
);

// Auth endpoints rate limiter (stricter)
const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  50, // More attempts allowed for development
  'Too many login attempts, please try again later'
);

// Device data ingestion rate limiter (per MAC)
const deviceLimiterStore = new Map();

const deviceLimiter = (req, res, next) => {
  const mac = req.query.MAC || req.body.MAC;

  if (!mac) {
    return next();
  }

  const now = Date.now();
  const record = deviceLimiterStore.get(mac) || {
    count: 0,
    resetTime: now + config.deviceRateLimit.windowMs,
  };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + config.deviceRateLimit.windowMs;
  } else {
    record.count += 1;
  }

  deviceLimiterStore.set(mac, record);

  if (record.count > config.deviceRateLimit.maxRequests) {
    return next(new TooManyRequestsError('Device sending data too frequently'));
  }

  // Cleanup old entries every 1000 requests
  if (deviceLimiterStore.size > 1000) {
    for (const [key, value] of deviceLimiterStore.entries()) {
      if (now > value.resetTime) {
        deviceLimiterStore.delete(key);
      }
    }
  }

  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  deviceLimiter,
};
