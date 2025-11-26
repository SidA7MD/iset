// backend/src/routes/testRealtime.routes.js
// TEST ENDPOINT - Add this to verify real-time data flow

const express = require('express');
const router = express.Router();
const websocketService = require('../services/websocketService');
const logger = require('../utils/logger');

// Test endpoint to manually trigger WebSocket broadcast
router.get('/broadcast-test', (req, res) => {
  const { MAC = 'AA:BB:CC:DD:EE:FF' } = req.query;

  const testData = {
    MAC,
    temperature: Math.random() * 30 + 15, // 15-45°C
    humidity: Math.random() * 40 + 30, // 30-70%
    gas: Math.random() * 500 + 200, // 200-700 ppm
    timestamp: new Date(),
    alertTriggered: false,
    alertTypes: [],
  };

  logger.info('🧪 TEST: Broadcasting test data', testData);

  try {
    websocketService.broadcastSensorData(MAC, testData);

    res.json({
      success: true,
      message: 'Test broadcast sent',
      data: testData,
      websocketStats: websocketService.getStats(),
    });
  } catch (error) {
    logger.error('❌ TEST: Broadcast failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Check WebSocket connection status
router.get('/ws-status', (req, res) => {
  const stats = websocketService.getStats();

  res.json({
    success: true,
    websocket: {
      initialized: !!websocketService.io,
      stats,
    },
  });
});

// Check if specific user is connected
router.get('/user-connected/:userId', (req, res) => {
  const { userId } = req.params;
  const isConnected = websocketService.isUserConnected(userId);

  res.json({
    success: true,
    userId,
    connected: isConnected,
  });
});

module.exports = router;

// ============================================
// Add this to backend/src/app.js (after other routes):

// Test endpoints (DEVELOPMENT ONLY)

// ============================================
// TESTING INSTRUCTIONS:

// 1. Add the route file above as: backend/src/routes/testRealtime.routes.js

// 2. Add to backend/src/app.js after line with testDevice routes

// 3. Restart backend server

// 4. Test WebSocket status:
//    curl http://localhost:3000/api/test-realtime/ws-status

// 5. Test manual broadcast:
//    curl "http://localhost:3000/api/test-realtime/broadcast-test?MAC=AA:BB:CC:DD:EE:FF"

// 6. Check your browser console - you should see:
//    📊 Received sensor data: {...}

// This will help us identify if the issue is:
// A) WebSocket not broadcasting at all
// B) Frontend not receiving broadcasts
// C) Device not subscribed to correct room
