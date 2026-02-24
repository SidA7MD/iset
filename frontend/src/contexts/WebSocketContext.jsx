// frontend/src/contexts/WebSocketContext.jsx
// FIXED VERSION - Handles token expiration and auto-reconnect

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { WS_URL } from '../utils/constants';

export const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, accessToken, refreshAccessToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const tokenRefreshInProgressRef = useRef(false);

  useEffect(() => {
    if (!user || !accessToken) {
      console.log('🔌 No user/token - skipping WebSocket connection');
      return;
    }

    console.log('🔌 Initializing WebSocket connection...');
    console.log('🔌 Connecting to WebSocket:', WS_URL);

    // Initialize socket with current token
    const socket = io(WS_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    socketRef.current = socket;

    // ✅ Connection success handler
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;
    });

    // ✅ Connection confirmation from server
    socket.on('connection:success', (data) => {
      console.log('✅ Server confirmed connection:', data);
      console.log('📱 Assigned devices:', data.assignedDevices);
    });

    // ✅ FIX: Handle connection errors with token refresh
    socket.on('connect_error', async (error) => {
      const errorMessage = error.message || String(error);
      console.error('❌ Connection error:', errorMessage);

      // Check if it's a token-related error
      if (
        errorMessage.includes('TOKEN_EXPIRED') ||
        errorMessage.includes('TOKEN_INVALID') ||
        errorMessage.includes('TOKEN_ERROR')
      ) {
        console.log('🔄 Token error detected - attempting to refresh...');

        // Prevent multiple simultaneous refresh attempts
        if (tokenRefreshInProgressRef.current) {
          console.log('⏳ Token refresh already in progress...');
          return;
        }

        tokenRefreshInProgressRef.current = true;

        try {
          // Try to refresh the access token
          const newToken = await refreshAccessToken();

          if (newToken) {
            console.log('✅ Token refreshed - reconnecting with new token...');

            // Update socket authentication with new token
            socket.auth = { token: newToken };

            // Disconnect and reconnect with new token
            socket.disconnect();
            socket.connect();
          } else {
            console.error('❌ Failed to refresh token');
            setConnectionError('Session expired - please log in again');
          }
        } catch (refreshError) {
          console.error('❌ Token refresh error:', refreshError);
          setConnectionError('Authentification échouée - veuillez vous reconnecter');
        } finally {
          tokenRefreshInProgressRef.current = false;
        }
      } else {
        // Other connection errors
        setConnectionError(errorMessage);
      }

      console.log('Error details:', error);
    });

    // ✅ Disconnect handler
    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);

      // If server initiated disconnect due to token, try to refresh
      if (reason === 'io server disconnect' && !tokenRefreshInProgressRef.current) {
        console.log('🔄 Server disconnected - checking token...');
        tokenRefreshInProgressRef.current = true;

        refreshAccessToken()
          .then((newToken) => {
            if (newToken) {
              console.log('✅ Token refreshed - manual reconnect...');
              socket.auth = { token: newToken };
              socket.connect();
            }
          })
          .catch((err) => {
            console.error('❌ Token refresh failed:', err);
          })
          .finally(() => {
            tokenRefreshInProgressRef.current = false;
          });
      }
    });

    // ✅ Reconnection attempt tracking
    socket.io.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt #${attempt}`);
      reconnectAttemptsRef.current = attempt;
    });

    // ✅ Reconnection success
    socket.io.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
    });

    // ✅ Reconnection failed
    socket.io.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after maximum attempts');
      setConnectionError('Connexion perdue - veuillez rafraîchir la page');
    });

    // ✅ Generic error handler
    socket.on('error', (error) => {
      const errorData = typeof error === 'object' ? error : { message: error };
      console.error('❌ Socket error:', errorData);

      // Handle specific error codes
      if (errorData.code === 'TOKEN_EXPIRED' || errorData.code === 'TOKEN_INVALID') {
        console.log('🔄 Token error from server - refreshing...');

        if (!tokenRefreshInProgressRef.current) {
          tokenRefreshInProgressRef.current = true;

          refreshAccessToken()
            .then((newToken) => {
              if (newToken) {
                // Notify server of new token
                socket.emit('token:refresh', { token: newToken });
              }
            })
            .finally(() => {
              tokenRefreshInProgressRef.current = false;
            });
        }
      }
    });

    // ✅ Token refresh confirmation
    socket.on('token:refreshed', (data) => {
      console.log('✅ Server confirmed token refresh:', data);
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket (unmount)');
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, accessToken, refreshAccessToken]);

  const value = {
    socket: socketRef.current,
    isConnected,
    connectionError,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
