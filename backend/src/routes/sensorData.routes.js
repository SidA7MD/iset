// =====================================================
// backend/src/routes/sensorData.routes.js
// UPDATE to use the correct validators

const express = require('express');
const router = express.Router();
const sensorDataController = require('../controllers/sensorDataController');
const auth = require('../middleware/auth');
const { deviceLimiter } = require('../middleware/rateLimiter');
const { deviceDataValidationGET, deviceDataValidationPOST } = require('../middleware/validator');

// Public routes for device data ingestion
router.get('/ingest', deviceLimiter, deviceDataValidationGET, sensorDataController.ingestData);
router.post('/ingest', deviceLimiter, deviceDataValidationPOST, sensorDataController.ingestData);

// Protected routes
router.get('/:MAC/latest', auth, sensorDataController.getLatest);
router.get('/:MAC/history', auth, sensorDataController.getHistory);
router.get('/:MAC/stats', auth, sensorDataController.getStatistics);

module.exports = router;
