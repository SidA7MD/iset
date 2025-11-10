// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { authLimiter } = require('../middleware/rateLimiter');
const { loginValidation, createUserValidation } = require('../middleware/validator');
const { ROLES } = require('../config/constants');

// Public routes
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/refresh', authController.refresh);

// Admin only - create users
router.post(
  '/register',
  auth,
  roleCheck([ROLES.ADMIN]),
  createUserValidation,
  authController.register
);

// Protected routes
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);

module.exports = router;
