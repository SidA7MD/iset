const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const websocketService = require('./src/services/websocketService');
const config = require('./src/config/env');

const server = http.createServer(app);

const start = async () => {
  try {
    await connectDB();

    // ✅ FIX: Enable trust proxy BEFORE initializing WebSocket
    // This is critical for Render deployment and rate limiting
    app.set('trust proxy', 1);

    websocketService.initialize(server);

    const PORT = process.env.PORT || config.port || 3000;
    const HOST = '0.0.0.0';

    server.listen(PORT, HOST, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
};

start();
