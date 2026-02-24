const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const websocketService = require('./src/services/websocketService');
const config = require('./src/config/env');

const server = http.createServer(app);

const start = async () => {
  try {
    const PORT = process.env.PORT || config.port || 3000;
    const HOST = '0.0.0.0';

    // ✅ Start listening as early as possible so Render sees the service as "up"
    server.listen(PORT, HOST, () => {
      console.log(`🚀 Server starting on port ${PORT}...`);
      console.log(`📡 Health check available at: http://localhost:${PORT}/health`);
    });

    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connection established.');

    // ✅ Enable trust proxy for Render/Vercel
    app.set('trust proxy', 1);

    websocketService.initialize(server);
    console.log('🔌 WebSocket service initialized.');

  } catch (err) {
    console.error('❌ CRITICAL Startup error:', err);
    // Log the full error object if it's not a standard error
    if (err && typeof err === 'object' && !(err instanceof Error)) {
      console.error('Error detail:', JSON.stringify(err, null, 2));
    }
    process.exit(1);
  }
};

start();
