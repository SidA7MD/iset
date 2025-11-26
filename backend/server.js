// backend/server.js
const http = require('http');
const os = require('os');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const websocketService = require('./src/services/websocketService');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');

// Function to get local network IP
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

// Create HTTP server
const server = http.createServer(app);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Graceful shutdown
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown on SIGTERM or SIGINT
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server function
const startServer = async () => {
  try {
    logger.info('Environment Variables:');
    logger.info(`NODE_ENV: ${config.nodeEnv}`);
    logger.info(`HOST: ${config.host}`);
    logger.info(`PORT: ${config.port}`);

    logger.info('Connecting to database...');
    await connectDB();
    logger.info('Database connected successfully');

    try {
      websocketService.initialize(server);
      logger.info('WebSocket service initialized');
    } catch (err) {
      logger.error('WebSocket initialization failed:', err);
    }

    const host = config.host || '0.0.0.0';
    const localIP = getLocalIP();

    server.listen(config.port, host, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`Local access: http://localhost:${config.port}/health`);
      logger.info(`LAN access: http://${localIP}:${config.port}/health`);
      logger.info(`Share this URL with devices on your network: http://${localIP}:${config.port}`);
    });

    server.on('error', (err) => {
      logger.error('Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
