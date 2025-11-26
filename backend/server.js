// backend/server.js
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const websocketService = require('./src/services/websocketService');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');
const os = require('os');

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
websocketService.initialize(server);

// Function to get local network IP
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const host = config.host || '0.0.0.0';
    const localIP = getLocalIP();

    // Start server - bind to 0.0.0.0 to accept connections from any network interface
    server.listen(config.port, host, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`WebSocket server initialized`);
      logger.info(`Local access: http://localhost:${config.port}/health`);
      logger.info(`LAN access: http://${localIP}:${config.port}/health`);
      logger.info(`Share this URL with devices on your network: http://${localIP}:${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();
