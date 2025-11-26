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

// Start server function
const startServer = async () => {
  try {
    await connectDB();
    websocketService.initialize(server);

    const port = process.env.PORT || config.port || 3000;
    const host = '0.0.0.0';

    server.listen(port, host, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
