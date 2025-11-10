// frontend/src/services/websocketClient.js
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// Remove /api suffix if present for WebSocket connection
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_URL = API_URL.replace('/api', ''); // WebSocket connects to base URL, not /api

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.eventHandlers = new Map(); // Store all event handlers
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return this.socket;
    }

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
      this.reconnectAttempts = 0;
      toast.success('Connected to real-time updates');
    });

    this.socket.on('connection:success', (data) => {
      console.log('✅ Connection success:', data);
      console.log('📱 Assigned devices:', data.assignedDevices);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        toast.error('Disconnected from server');
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Failed to connect to real-time updates');
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      toast.error(error.message || 'WebSocket error');
    });
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized, cannot add listener for:', event);
      return () => {}; // Return empty cleanup function
    }

    // Store the handler
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(callback);

    // Add listener to socket
    this.socket.on(event, callback);

    // Return cleanup function
    return () => {
      this.off(event, callback);
    };
  }

  off(event, callback) {
    if (!this.socket) {
      return;
    }

    // Remove from socket
    if (callback) {
      this.socket.off(event, callback);

      // Remove from our tracking
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(callback);
        if (handlers.size === 0) {
          this.eventHandlers.delete(event);
        }
      }
    } else {
      // Remove all listeners for this event
      this.socket.off(event);
      this.eventHandlers.delete(event);
    }
  }

  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot emit:', event);
      return false;
    }

    this.socket.emit(event, data);
    return true;
  }

  disconnect() {
    if (!this.socket) return;

    // Remove all custom event handlers
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket.off(event, handler);
      });
    });
    this.eventHandlers.clear();

    // Disconnect socket
    this.socket.disconnect();
    this.socket = null;
    console.log('WebSocket disconnected and cleaned up');
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  subscribeToDevice(MAC) {
    return this.emit('device:subscribe', { MAC });
  }

  acknowledgeAlert(alertId) {
    return this.emit('alert:acknowledge', { alertId });
  }
}

export default new WebSocketClient();
