// backend/src/utils/validators.js
const { SENSOR_LIMITS } = require('../config/constants');

const validateMAC = (mac) => {
  if (!mac || typeof mac !== 'string') {
    return false;
  }

  const trimmedMac = mac.trim();

  // Accept any non-empty string (minimum 1 character, maximum 50 characters)
  // This allows: DEV001, MyDevice, AA:BB:CC:DD:EE:GG, or any other format
  if (trimmedMac.length === 0 || trimmedMac.length > 50) {
    return false;
  }

  return true;
};

const validateSensorValue = (value, type) => {
  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return false;
  }

  const limits = SENSOR_LIMITS[type.toUpperCase()];
  if (!limits) {
    return false;
  }

  return numValue >= limits.min && numValue <= limits.max;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  if (!password || password.length < 8) return false;

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasUppercase && hasLowercase && hasNumber;
};

module.exports = {
  validateMAC,
  validateSensorValue,
  validateEmail,
  validatePassword,
};
