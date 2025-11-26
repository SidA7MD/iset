// backend/src/config/constants.js
module.exports = {
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
  },

  DEVICE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance',
  },

  ALERT_SEVERITY: {
    WARNING: 'warning',
    CRITICAL: 'critical',
  },

  ALERT_TYPES: {
    TEMPERATURE: 'temperature',
    HUMIDITY: 'humidity',
    GAS: 'gas',
  },

  SENSOR_LIMITS: {
    TEMPERATURE: { min: -50, max: 100 },
    HUMIDITY: { min: 0, max: 100 },
    GAS: { min: 0, max: 10000 },
  },

  DATA_RETENTION_DAYS: 30,

  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 500,
  },
};
