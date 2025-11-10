// =====================================================

// backend/src/routes/device.routes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { ROLES } = require('../config/constants');

// Admin routes
router.get('/', auth, roleCheck([ROLES.ADMIN]), deviceController.getAllDevices);
router.put('/:MAC', auth, roleCheck([ROLES.ADMIN]), deviceController.updateDevice);

// User routes
router.get('/my-devices', auth, deviceController.getMyDevices);
router.get('/:MAC', auth, deviceController.getDeviceByMAC);
router.get('/:MAC/status', auth, deviceController.getDeviceStatus);

module.exports = router;
