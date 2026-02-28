// frontend/src/services/websocketClient.js
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// Get WebSocket URL from environment or default - uses browser hostname for LAN support
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;
// Remove /api suffix if present for WebSocket connection
const WS_URL = API_URL.replace('/api', '');

console.log('🔧 WebSocket Configuration:', { API_URL, WS_URL });

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.eventHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isManualDisconnect = false;
  }

  connect(token) {
    // Prevent duplicate connections
    if (this.socket?.connected) {
      console.log('✅ WebSocket already connected');
      return this.socket;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      console.log('🔄 Disconnecting existing socket before reconnecting');
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('🔌 Connecting to WebSocket:', WS_URL);

    this.isManualDisconnect = false;

    this.socket = io(WS_URL, {
      auth: { token }, // Preferred method
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
      forceNew: true, // Force new connection
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  setupDefaultListeners() {
    if (!this.socket) {
      console.warn('⚠️ Cannot setup listeners - socket not initialized');
      return;
    }

    // Connection successful
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
      this.reconnectAttempts = 0;
      toast.success('Connecté aux mises à jour en temps réel', {
        id: 'ws-connect',
        duration: 2000,
      });
    });

    // Connection success confirmation from server
    this.socket.on('connection:success', (data) => {
      console.log('✅ Server confirmed connection:', data);
      console.log('📱 Assigned devices:', data.assignedDevices);
    });

    // Disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);

      // Only show toast if not a manual disconnect
      if (!this.isManualDisconnect) {
        if (reason === 'io server disconnect') {
          toast.error('Déconnecté par le serveur', { id: 'ws-disconnect' });
        } else if (reason === 'transport close' || reason === 'transport error') {
          toast.error('Connexion perdue', { id: 'ws-disconnect' });
        }
      }
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error?.message || error);
      this.reconnectAttempts++;

      // Show error toast only after multiple attempts
      if (this.reconnectAttempts >= 3) {
        toast.error('Impossible de se connecter au serveur', {
          id: 'ws-connect-error',
          duration: 4000,
        });
      }

      // Log more details about the error
      if (error?.message) {
        console.error('Error details:', {
          message: error.message,
          description: error.description,
          context: error.context,
          type: error.type,
        });
      }
    });

    // Reconnection attempt
    this.socket.io.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt #${attemptNumber}`);
    });

    // Reconnection failed
    this.socket.io.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after max attempts');
      toast.error('Reconnexion échouée. Veuillez rafraîchir la page.', {
        id: 'ws-reconnect-failed',
        duration: 0, // Don't auto-dismiss
      });
    });

    // Successful reconnection
    this.socket.io.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      toast.success('Reconnecté avec succès', {
        id: 'ws-reconnect',
        duration: 2000,
      });
      this.reconnectAttempts = 0;
    });

    // Generic socket error
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);

      const errorMsg = error?.message || 'Erreur WebSocket';

      // Show user-friendly error messages
      if (errorMsg.includes('expired')) {
        toast.error('Session expirée. Actualisation...', { id: 'ws-error' });
      } else if (errorMsg.includes('authentication')) {
        toast.error('Authentification échouée', { id: 'ws-error' });
      } else {
        toast.error(errorMsg, { id: 'ws-error' });
      }
    });

    // Ping/pong for connection monitoring
    this.socket.on('ping', () => {
      console.log('📡 Ping received from server');
    });

    this.socket.on('pong', (latency) => {
      console.log(`📡 Pong - latency: ${latency}ms`);
    });
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized, cannot add listener for:', event);
      return () => {}; // Return empty cleanup function
    }

    // Store the handler
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(callback);

    // Add listener to socket
    this.socket.on(event, callback);

    console.log(`👂 Added listener for: ${event}`);

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
      console.log(`🔇 Removed listener for: ${event}`);
    } else {
      // Remove all listeners for this event
      this.socket.off(event);
      this.eventHandlers.delete(event);
      console.log(`🔇 Removed all listeners for: ${event}`);
    }
  }

  emit(event, data) {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized, cannot emit:', event);
      return false;
    }

    if (!this.socket.connected) {
      console.warn('⚠️ Socket not connected, cannot emit:', event);
      return false;
    }

    console.log(`📤 Emitting: ${event}`, data);
    this.socket.emit(event, data);
    return true;
  }

  disconnect() {
    if (!this.socket) {
      return;
    }

    console.log('🔌 Manually disconnecting WebSocket');
    this.isManualDisconnect = true;

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
    this.reconnectAttempts = 0;

    console.log('✅ WebSocket disconnected and cleaned up');
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  getSocket() {
    return this.socket;
  }

  subscribeToDevice(MAC) {
    console.log(`📱 Subscribing to device: ${MAC}`);
    return this.emit('device:subscribe', { MAC });
  }

  acknowledgeAlert(alertId) {
    console.log(`✅ Acknowledging alert: ${alertId}`);
    return this.emit('alert:acknowledge', { alertId });
  }

  // Get connection state
  getConnectionState() {
    if (!this.socket) {
      return 'disconnected';
    }
    return this.socket.connected ? 'connected' : 'disconnected';
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }
}

// Export singleton instance
export default new WebSocketClient();
