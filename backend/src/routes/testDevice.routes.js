// =====================================================
// backend/src/routes/testDevice.routes.js
// Routes for device simulation (REMOVE IN PRODUCTION!)

const express = require('express');
const router = express.Router();
const testDeviceController = require('../controllers/testDeviceController');

// Single reading simulation
router.post('/simulate', testDeviceController.simulateReading);

// Continuous readings simulation
router.post('/simulate/continuous', testDeviceController.simulateContinuous);

// Alert-triggering simulation
router.post('/simulate/alert', testDeviceController.simulateAlert);

// Multiple devices simulation
router.post('/simulate/multiple', testDeviceController.simulateMultipleDevices);

module.exports = router;

// =====================================================
// Add to backend/src/app.js (before error handlers)
// IMPORTANT: Only include in development environment!




// =====================================================
// USAGE EXAMPLES (via Postman, Insomnia, or curl)

// 1. Simulate a single reading with random values
// POST http://localhost:3000/api/test-device/simulate
// Body: {}

// 2. Simulate a single reading with specific values
// POST http://localhost:3000/api/test-device/simulate
// Body: {
//   "MAC": "AA:BB:CC:DD:EE:FF",
//   "temp": 25.5,
//   "hmdt": 60.2,
//   "gaz": 350.8,
//   "method": "GET"
// }

// 3. Simulate continuous readings
// POST http://localhost:3000/api/test-device/simulate/continuous
// Body: {
//   "MAC": "AA:BB:CC:DD:EE:FF",
//   "count": 10,
//   "interval": 1000,
//   "method": "GET"
// }

// 4. Simulate alert-triggering reading
// POST http://localhost:3000/api/test-device/simulate/alert
// Body: {
//   "MAC": "AA:BB:CC:DD:EE:FF",
//   "alertType": "temperature",
//   "method": "GET"
// }

// 5. Simulate multiple devices
// POST http://localhost:3000/api/test-device/simulate/multiple
// Body: {
//   "deviceCount": 3,
//   "readingsPerDevice": 5,
//   "interval": 2000,
//   "method": "GET"
// }
