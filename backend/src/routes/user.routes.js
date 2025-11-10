// =====================================================

// backend/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { assignDevicesValidation } = require('../middleware/validator');
const { ROLES } = require('../config/constants');

// All routes require authentication and admin role
router.use(auth);
router.use(roleCheck([ROLES.ADMIN]));

router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);
router.post('/:userId/assign-devices', assignDevicesValidation, userController.assignDevices);
router.delete('/:userId/devices/:MAC', userController.removeDevice);
router.get('/:userId/devices', userController.getUserDevices);

module.exports = router;
