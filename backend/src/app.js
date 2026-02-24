const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');

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
    const allowed = config.cors.allowedOrigins;

    // Check if origin is allowed or if it represents a non-browser request (no origin)
    if (!origin || allowed === '*' || allowed.includes(origin)) {
      if (origin) console.log(`✅ CORS check passed for origin: ${origin}`);
      return callback(null, true);
    }

    console.warn(`❌ CORS check FAILED for origin: ${origin}`);
    console.info(`Allowed origins are: ${JSON.stringify(allowed)}`);
    return callback(new Error('Blocked by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware first
app.use(cors(corsOptions));

// Handle OPTIONS preflight explicitly if needed (redundant with cors middleware but safer)
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/sensor-data', sensorDataRoutes);
app.use('/api/alerts', alertRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
