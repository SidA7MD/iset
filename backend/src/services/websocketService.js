// backend/src/services/websocketService.js
const socketIo = require('socket.io');
const tokenManager = require('../utils/tokenManager');
const User = require('../models/User');
const logger = require('../utils/logger');
const config = require('../config/env');

class WebSocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> Set of socket IDs
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: config.cors.allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // register middleware & connection handler
    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));

    logger.info('WebSocket server initialized', { timestamp: new Date().toISOString() });
  }

  async authenticateSocket(socket, next) {
    try {
      // tokens can be sent via auth payload (preferred) or query param for older clients
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        logger.warn('WebSocket authentication failed - no token provided', { socketId: socket.id });
        return next(new Error('authentication token required'));
      }

      // tokenManager.verifyAccessToken should throw on invalid/expired
      const decoded = tokenManager.verifyAccessToken(token);

      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        logger.warn('WebSocket authentication failed - user not found or inactive', {
          userId: decoded.userId,
        });
        return next(new Error('user not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.assignedDevices = user.assignedDevices || [];

      return next();
    } catch (error) {
      // Distinguish expired token from other errors so client knows to refresh
      const message =
        (error && error.name === 'TokenExpiredError') || (error && /expired/i.test(error.message))
          ? 'expired access token'
          : /invalid|malformed|jwt/i.test(error.message || '')
          ? 'invalid access token'
          : 'authentication failed';

      logger.error('WebSocket authentication failed', {
        socketId: socket.id,
        error: error && error.message ? error.message : String(error),
        reportedMessage: message,
      });

      return next(new Error(message));
    }
  }

  handleConnection(socket) {
    const userId = socket.userId;

    logger.info(`WebSocket connected`, { user: userId, socketId: socket.id });

    // Track user's sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);

    // Join rooms for assigned devices
    (socket.assignedDevices || []).forEach((mac) => {
      socket.join(`device:${mac}`);
      logger.info(`Socket joined device room`, { socketId: socket.id, room: `device:${mac}` });
    });

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Send connection confirmation
    socket.emit('connection:success', {
      message: 'Connected to IoT Monitoring Platform',
      userId,
      assignedDevices: socket.assignedDevices,
    });

    // Handle alert acknowledgment
    socket.on('alert:acknowledge', async (data) => {
      try {
        logger.info('Alert acknowledgment received', { user: userId, data });
        socket.emit('alert:acknowledged', { alertId: data.alertId });
      } catch (error) {
        logger.error('Error handling alert acknowledgment', { error: error && error.message });
        socket.emit('error', { message: 'Failed to acknowledge alert' });
      }
    });

    // Handle dynamic device subscription
    socket.on('device:subscribe', (data) => {
      const { MAC } = data || {};
      if (!MAC) return socket.emit('error', { message: 'MAC required' });

      if ((socket.assignedDevices || []).includes(MAC)) {
        socket.join(`device:${MAC}`);
        socket.emit('device:subscribed', { MAC });
        logger.info('Socket subscribed to device', { socketId: socket.id, MAC });
      } else {
        socket.emit('error', { message: 'Device not assigned to user' });
      }
    });

    // Disconnect handling
    socket.on('disconnect', (reason) => {
      logger.info('WebSocket disconnected', { user: userId, socketId: socket.id, reason });

      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    });

    // Generic socket error
    socket.on('error', (error) => {
      logger.error('Socket error', {
        user: userId,
        socketId: socket.id,
        error: error && error.message ? error.message : error,
      });
    });
  }

  // Broadcast sensor data to specific device room
  broadcastSensorData(MAC, sensorData) {
    if (!this.io) return;
    const room = `device:${MAC}`;
    const payload = {
      MAC: sensorData.MAC,
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      gas: sensorData.gas,
      timestamp: sensorData.timestamp,
      alertTriggered: sensorData.alertTriggered,
      alertTypes: sensorData.alertTypes,
    };
    this.io.to(room).emit('sensor:data', payload);
    logger.info('Broadcast sensor data', { room });
  }

  // Broadcast alert to specific device room
  broadcastAlert(MAC, alert) {
    if (!this.io) return;
    const room = `device:${MAC}`;
    const payload = {
      _id: alert._id,
      MAC: alert.MAC,
      alertType: alert.alertType,
      severity: alert.severity,
      value: alert.value,
      threshold: alert.threshold,
      message: alert.message,
      createdAt: alert.createdAt,
    };
    this.io.to(room).emit('device:alert', payload);
    logger.info('Broadcast alert', { room });
  }

  // Notify user of device assignment
  notifyDeviceAssignment(userId, devices) {
    if (!this.io) return;
    const room = `user:${userId}`;
    this.io.to(room).emit('user:device-assigned', { devices });
    logger.info('Notified device assignment', { userId, devices });
  }

  // Broadcast device status change
  broadcastDeviceStatus(MAC, status) {
    if (!this.io) return;
    const room = `device:${MAC}`;
    this.io.to(room).emit('device:status', { MAC, status });
    logger.info('Broadcast device status', { MAC, status });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.userSockets.has(userId);
  }
}

module.exports = new WebSocketService();
