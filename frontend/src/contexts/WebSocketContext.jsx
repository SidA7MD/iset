// frontend/src/contexts/WebSocketContext.jsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import axiosInstance from '../api/axios.config';
import websocketClient from '../services/websocketClient';
import { useAuth } from './AuthContext';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { token, isAuthenticated, isLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Refs to prevent loops and race conditions
  const hasInitialized = useRef(false);
  const connectionTimeout = useRef(null);
  const cleanupFunctions = useRef([]);
  const isMounted = useRef(true);

  // Helper: try to refresh access token
  const tryRefreshToken = useCallback(async () => {
    try {
      console.log('🔄 Attempting token refresh...');
      const resp = await axiosInstance.post('/auth/refresh', {}, { withCredentials: true });
      const newToken = resp?.data?.data?.accessToken || resp?.data?.accessToken;
      if (newToken) {
        console.log('✅ Token refreshed successfully');
        localStorage.setItem('accessToken', newToken);
        return newToken;
      }
      console.warn('⚠️ Token refresh returned no token');
      return null;
    } catch (err) {
      console.error('❌ Token refresh failed:', err.message);
      return null;
    }
  }, []);

  // Main connection setup
  useEffect(() => {
    // Mark as mounted
    isMounted.current = true;

    // Wait for auth to load
    if (isLoading) {
      console.log('⏳ Waiting for auth to load...');
      return;
    }

    // Not authenticated - don't connect
    if (!isAuthenticated || !token) {
      console.log('⚠️ Not authenticated, skipping WebSocket');
      setIsReady(true);
      return;
    }

    // Already initialized - don't re-initialize
    if (hasInitialized.current) {
      console.log('✅ WebSocket already initialized');
      return;
    }

    console.log('🔌 Initializing WebSocket connection...');
    hasInitialized.current = true;

    // Set connection timeout
    connectionTimeout.current = setTimeout(() => {
      if (isMounted.current && !isConnected) {
        console.error('❌ Connection timeout (10s)');
        setConnectionError('Connection timeout. Server may be unreachable.');
        setIsReady(true);
      }
    }, 10000);

    try {
      // Connect to WebSocket
      websocketClient.connect(token);

      // Handle successful connection
      const unsubConnect = websocketClient.on('connect', () => {
        if (!isMounted.current) return;

        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        setIsReady(true);

        if (connectionTimeout.current) {
          clearTimeout(connectionTimeout.current);
          connectionTimeout.current = null;
        }
      });
      cleanupFunctions.current.push(unsubConnect);

      // Handle disconnection
      const unsubDisconnect = websocketClient.on('disconnect', (reason) => {
        if (!isMounted.current) return;

        console.log('❌ WebSocket disconnected:', reason);
        setIsConnected(false);

        // Only show error for unexpected disconnections
        if (reason !== 'io client disconnect' && reason !== 'client namespace disconnect') {
          console.warn('⚠️ Unexpected disconnection:', reason);
        }
      });
      cleanupFunctions.current.push(unsubDisconnect);

      // Handle connection errors
      const unsubConnectError = websocketClient.on('connect_error', async (err) => {
        if (!isMounted.current) return;

        console.error('❌ WebSocket connection error:', err?.message || err);
        setIsReady(true);

        const errMsg = String(err?.message || err || '');

        // Handle token expiration
        if (/expired|token/i.test(errMsg)) {
          console.log('🔑 Token issue detected, attempting refresh...');
          const newToken = await tryRefreshToken();

          if (newToken && isMounted.current) {
            console.log('✅ Token refreshed, reconnecting...');
            // Let socket.io handle reconnection with new token
            websocketClient.disconnect();
            hasInitialized.current = false;
            setTimeout(() => {
              if (isMounted.current) {
                websocketClient.connect(newToken);
              }
            }, 1000);
          } else {
            console.error('❌ Token refresh failed');
            setConnectionError('Session expired. Please log in again.');
            localStorage.removeItem('accessToken');
          }
          return;
        }

        // Generic connection error
        setConnectionError(errMsg || 'Failed to connect to server');

        if (connectionTimeout.current) {
          clearTimeout(connectionTimeout.current);
          connectionTimeout.current = null;
        }
      });
      cleanupFunctions.current.push(unsubConnectError);

      // Handle generic socket errors
      const unsubError = websocketClient.on('error', (error) => {
        if (!isMounted.current) return;
        console.error('❌ Socket error:', error);
      });
      cleanupFunctions.current.push(unsubError);

      // Check if already connected
      if (websocketClient.isConnected()) {
        setIsConnected(true);
        setIsReady(true);
        if (connectionTimeout.current) {
          clearTimeout(connectionTimeout.current);
          connectionTimeout.current = null;
        }
      } else {
        // Set ready after a short delay to avoid blocking UI
        setTimeout(() => {
          if (isMounted.current && !isConnected) {
            setIsReady(true);
          }
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Error setting up WebSocket:', error);
      setConnectionError(error?.message || 'Failed to initialize WebSocket');
      setIsReady(true);

      if (connectionTimeout.current) {
        clearTimeout(connectionTimeout.current);
        connectionTimeout.current = null;
      }
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up WebSocket (unmount)');
      isMounted.current = false;

      if (connectionTimeout.current) {
        clearTimeout(connectionTimeout.current);
        connectionTimeout.current = null;
      }

      // Remove all event listeners
      cleanupFunctions.current.forEach(fn => {
        try {
          fn();
        } catch (e) {
          console.error('Error during cleanup:', e);
        }
      });
      cleanupFunctions.current = [];

      // Only disconnect if not authenticated anymore
      if (!isAuthenticated) {
        websocketClient.disconnect();
        hasInitialized.current = false;
      }
    };
  }, [isAuthenticated, token, isLoading, isConnected, tryRefreshToken]);

  const value = {
    isConnected,
    isReady,
    connectionError,
    socket: websocketClient,
  };

  // Show loading state only briefly
  if (!isReady && isAuthenticated && !connectionError) {
    return (
      <WebSocketContext.Provider value={value}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#666',
          gap: '20px'
        }}>
          <div style={{ fontSize: '24px' }}>⏳</div>
          <div>Connecting to real-time updates...</div>
        </div>
      </WebSocketContext.Provider>
    );
  }

  return (
    <WebSocketContext.Provider value={value}>
      {connectionError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#fee',
          color: '#c00',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 9999,
          maxWidth: '400px',
          fontSize: '14px'
        }}>
          <strong>⚠️ Connection Error:</strong>
          <div style={{ marginTop: '5px' }}>{connectionError}</div>
        </div>
      )}
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};
