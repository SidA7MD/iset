// backend/src/services/websocketService.js
// UPDATED VERSION - Reduced logging for cleaner output

const socketIo = require('socket.io');
const tokenManager = require('../utils/tokenManager');
const User = require('../models/User');
const logger = require('../utils/logger');
const config = require('../config/env');

class WebSocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> Set of socket IDs
    this.connectionLog = new Map(); // Track connection frequency per user
  }

  initialize(server) {
    // Parse allowed origins
    let allowedOrigins = config.cors.allowedOrigins;

    if (allowedOrigins === '*') {
      allowedOrigins = true;
    }

    this.io = socketIo(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e6,
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));

    logger.info('WebSocket server initialized', {
      timestamp: new Date().toISOString(),
      allowedOrigins: allowedOrigins === true ? 'all' : allowedOrigins,
    });

    // Log stats periodically instead of every connection
    setInterval(() => {
      const stats = this.getStats();
      if (stats.connectedUsers > 0) {
        logger.info('WebSocket stats', stats);
      }
    }, 60000); // Every 60 seconds
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      let decoded;
      try {
        decoded = tokenManager.verifyAccessToken(token);
      } catch (tokenError) {
        if (tokenError.name === 'TokenExpiredError') {
          return next(new Error('Expired access token'));
        }
        return next(new Error('Invalid access token'));
      }

      const user = await User.findById(decoded.userId).select('role assignedDevices isActive');

      if (!user) {
        return next(new Error('User not found'));
      }

      if (!user.isActive) {
        return next(new Error('User account is inactive'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.assignedDevices = user.assignedDevices || [];

      // Only log first connection for each user session
      if (!this.userSockets.has(socket.userId)) {
        logger.info('User connected via WebSocket', {
          userId: socket.userId,
          role: socket.userRole,
          deviceCount: socket.assignedDevices.length,
        });
      }

      return next();
    } catch (error) {
      logger.error('WebSocket authentication error', {
        socketId: socket.id,
        error: error.message,
      });
      return next(new Error('Authentication failed'));
    }
  }

  handleConnection(socket) {
    const userId = socket.userId;

    // Track user's sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Join rooms for assigned devices (silent)
    if (socket.assignedDevices && socket.assignedDevices.length > 0) {
      socket.assignedDevices.forEach((mac) => {
        socket.join(`device:${mac}`);
      });
    }

    // Send connection confirmation
    socket.emit('connection:success', {
      message: 'Connected to IoT Monitoring Platform',
      userId,
      socketId: socket.id,
      assignedDevices: socket.assignedDevices,
      timestamp: new Date().toISOString(),
    });

    // Handle alert acknowledgment
    socket.on('alert:acknowledge', async (data) => {
      try {
        socket.emit('alert:acknowledged', {
          alertId: data.alertId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Error handling alert acknowledgment', {
          error: error.message,
          userId,
        });
        socket.emit('error', {
          message: 'Failed to acknowledge alert',
          code: 'ALERT_ACK_ERROR',
        });
      }
    });

    // Handle dynamic device subscription
    socket.on('device:subscribe', (data) => {
      const { MAC } = data || {};

      if (!MAC) {
        return socket.emit('error', {
          message: 'MAC address required',
          code: 'MISSING_MAC',
        });
      }

      if (!socket.assignedDevices || !socket.assignedDevices.includes(MAC)) {
        return socket.emit('error', {
          message: 'Device not assigned to user',
          code: 'DEVICE_NOT_ASSIGNED',
        });
      }

      const room = `device:${MAC}`;
      socket.join(room);
      socket.emit('device:subscribed', { MAC, timestamp: new Date().toISOString() });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);

        // Only log when user completely disconnects (no more sockets)
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
          logger.info('User disconnected from WebSocket', {
            userId,
            reason: reason !== 'client namespace disconnect' ? reason : 'normal',
          });
        }
      }
    });

    // Handle socket errors (only log significant ones)
    socket.on('error', (error) => {
      const errMsg = error?.message || String(error);
      if (!errMsg.includes('transport') && !errMsg.includes('ping timeout')) {
        logger.error('Socket error', {
          userId,
          socketId: socket.id,
          error: errMsg,
        });
      }
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
      alertTriggered: sensorData.alertTriggered || false,
      alertTypes: sensorData.alertTypes || [],
    };

    this.io.to(room).emit('sensor:data', payload);

    // Only log if there are alerts
    if (payload.alertTriggered) {
      logger.info('Broadcast sensor data with alerts', {
        MAC,
        alertTypes: payload.alertTypes,
      });
    }
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
    logger.info('Alert broadcast', {
      MAC,
      alertType: alert.alertType,
      severity: alert.severity,
    });
  }

  // Notify user of device assignment
  notifyDeviceAssignment(userId, devices) {
    if (!this.io) return;

    const room = `user:${userId}`;
    this.io.to(room).emit('user:device-assigned', {
      devices,
      timestamp: new Date().toISOString(),
    });
    logger.info('Device assignment notified', { userId, deviceCount: devices.length });
  }

  // Broadcast device status change
  broadcastDeviceStatus(MAC, status) {
    if (!this.io) return;

    const room = `device:${MAC}`;
    this.io.to(room).emit('device:status', {
      MAC,
      status,
      timestamp: new Date().toISOString(),
    });
    logger.info('Device status broadcast', { MAC, status });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  // Get connected sockets count
  getConnectedSocketsCount() {
    let count = 0;
    this.userSockets.forEach((sockets) => {
      count += sockets.size;
    });
    return count;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.userSockets.has(userId);
  }

  // Get stats
  getStats() {
    return {
      connectedUsers: this.getConnectedUsersCount(),
      connectedSockets: this.getConnectedSocketsCount(),
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new WebSocketService();
