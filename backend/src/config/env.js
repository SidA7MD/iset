// backend/src/config/env.js
require('dotenv').config();

// Helper to parse CORS origins
const parseCorsOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS;

  // If * is specified, allow all origins
  if (origins === '*') {
    return '*';
  }

  // Otherwise parse comma-separated list
  return origins?.split(',').map((o) => o.trim()) || ['http://localhost:5173'];
};

module.exports = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'production',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/iot_monitoring',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  cors: {
    allowedOrigins: parseCorsOrigins(),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  deviceRateLimit: {
    windowMs: parseInt(process.env.DEVICE_RATE_LIMIT_WINDOW_MS) || 5000,
    maxRequests: parseInt(process.env.DEVICE_RATE_LIMIT_MAX_REQUESTS) || 1,
  },

  thresholds: {
    temperature: {
      warning: parseFloat(process.env.TEMP_WARNING) || 35,
      critical: parseFloat(process.env.TEMP_CRITICAL) || 40,
    },
    humidity: {
      low: parseFloat(process.env.HUMIDITY_LOW) || 20,
      high: parseFloat(process.env.HUMIDITY_HIGH) || 80,
    },
    gas: {
      warning: parseFloat(process.env.GAS_WARNING) || 300,
      critical: parseFloat(process.env.GAS_CRITICAL) || 500,
    },
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
};
