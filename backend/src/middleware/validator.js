// backend/src/middleware/validator.js
const { body, query, param, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errorTypes');
const { validateMAC, validateEmail, validatePassword } = require('../utils/validators');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((err) => err.msg)
      .join(', ');
    return next(new ValidationError(messages));
  }
  next();
};

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const createUserValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .custom(validateEmail)
    .withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .custom(validatePassword)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
  validate,
];

// For GET requests (query parameters)
const deviceDataValidationGET = [
  query('MAC')
    .notEmpty()
    .withMessage('MAC is required')
    .custom(validateMAC)
    .withMessage('Device ID must be 1-50 characters'),
  query('temp')
    .notEmpty()
    .withMessage('Temperature is required')
    .isFloat({ min: -50, max: 100 })
    .withMessage('Temperature out of range'),
  query('hmdt')
    .notEmpty()
    .withMessage('Humidity is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity out of range'),
  query('gaz')
    .notEmpty()
    .withMessage('Gas level is required')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Gas level out of range'),
  validate,
];

// For POST requests (body parameters)
const deviceDataValidationPOST = [
  body('MAC')
    .notEmpty()
    .withMessage('MAC is required')
    .custom(validateMAC)
    .withMessage('Device ID must be 1-50 characters'),
  body('temp')
    .notEmpty()
    .withMessage('Temperature is required')
    .isFloat({ min: -50, max: 100 })
    .withMessage('Temperature out of range'),
  body('hmdt')
    .notEmpty()
    .withMessage('Humidity is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity out of range'),
  body('gaz')
    .notEmpty()
    .withMessage('Gas level is required')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Gas level out of range'),
  validate,
];

// FIXED: Accept any non-empty string as device identifier (1-50 chars)
const assignDevicesValidation = [
  body('devices').isArray().withMessage('Devices must be an array'),
  body('devices.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Device identifier must be 1-50 characters')
    .notEmpty()
    .withMessage('Device identifier cannot be empty'),
  validate,
];

module.exports = {
  validate,
  loginValidation,
  createUserValidation,
  deviceDataValidationGET,
  deviceDataValidationPOST,
  assignDevicesValidation,
};
