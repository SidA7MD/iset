// =====================================================

// backend/src/routes/alert.routes.js
const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', alertController.getAlerts);
router.put('/:alertId/acknowledge', alertController.acknowledgeAlert);
router.get('/device/:MAC', alertController.getDeviceAlerts);

module.exports = router;
