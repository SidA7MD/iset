const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const deviceRoutes = require('./routes/device.routes');
const sensorDataRoutes = require('./routes/sensorData.routes');
const alertRoutes = require('./routes/alert.routes');

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // If no origin (like mobile apps or curl), allow it
    if (!origin) return callback(null, true);

    const allowed = config.cors.allowedOrigins;
    console.log(`🔍 Incoming request from origin: ${origin}`);
    console.log(`📋 Allowed origins: ${JSON.stringify(allowed)}`);

    if (allowed === '*' || (Array.isArray(allowed) && allowed.includes(origin))) {
      console.log(`✅ CORS check passed for: ${origin}`);
      return callback(null, true);
    }

    // Try a looser check for subdomains or trailing slashes if exact match fails
    const cleanOrigin = origin.replace(/\/$/, "");
    if (Array.isArray(allowed) && allowed.some(a => a.replace(/\/$/, "") === cleanOrigin)) {
      console.log(`✅ CORS check passed (approximate match) for: ${origin}`);
      return callback(null, true);
    }

    console.warn(`❌ CORS check FAILED for origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware first
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Logger for all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Debug endpoint for deployment issues
app.get('/api/debug', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'up',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: process.env.NODE_ENV,
    allowedOrigins: config.cors.allowedOrigins,
    headers: req.headers,
    url: req.url
  });
});

// API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/sensor-data', sensorDataRoutes);
app.use('/api/alerts', alertRoutes);

// 404 fallback
app.use((req, res) => {
  console.log(`[404] Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.url,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Global Error Path]:', req.path);
  console.error('[Error Detail]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});
