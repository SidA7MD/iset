// frontend/src/contexts/WebSocketContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import axiosInstance from '../api/axios.config';
import websocketClient from '../services/websocketClient';
import { useAuth } from './AuthContext';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { token, isAuthenticated, isLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const connectionAttempted = useRef(false);
  const connectionTimeout = useRef(null);

  // helper: try to refresh access token via cookies (refresh token cookie)
  const tryRefreshToken = async () => {
    try {
      const resp = await axiosInstance.post('/auth/refresh', {}, { withCredentials: true });
      const newToken = resp?.data?.data?.accessToken || resp?.data?.accessToken;
      if (newToken) {
        localStorage.setItem('accessToken', newToken);
        return newToken;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    // don't try connecting until auth finishes
    if (isLoading) {
      console.log('⏳ Waiting for auth to load...');
      return;
    }

    if (!isAuthenticated || !token) {
      console.log('⚠️ Not authenticated, skipping WebSocket connection');
      setIsReady(false);
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    // prevent duplicate attempts
    if (connectionAttempted.current) {
      console.log('⚠️ Connection already attempted, skipping');
      return;
    }
    connectionAttempted.current = true;

    console.log('🔌 Initializing WebSocket connection...');
    connectionTimeout.current = setTimeout(() => {
      if (!isConnected) {
        console.error('❌ Connection timeout - taking too long to connect');
        setConnectionError('Connection timeout. Please check if the server is running.');
        setIsReady(true); // avoid blocking UI forever
      }
    }, 10000); // 10 seconds

    let unsubConnect, unsubDisconnect, unsubConnectError;
    let socketInst;

    const startConnection = (currentToken) => {
      try {
        socketInst = websocketClient.connect(currentToken);
        setIsReady(true);
        console.log('✅ WebSocket client ready');

        const handleConnect = () => {
          console.log('✅ WebSocket connected in context');
          setIsConnected(true);
          setConnectionError(null);
          if (connectionTimeout.current) {
            clearTimeout(connectionTimeout.current);
          }
        };

        const handleDisconnect = (reason) => {
          console.log('❌ WebSocket disconnected in context', reason);
          setIsConnected(false);
        };

        const handleConnectError = async (err) => {
          console.error('❌ WebSocket connection error:', err && err.message ? err.message : err);

          // If server indicated expired token -> try refreshing token then reconnect
          const errMsg = (err && (err.message || String(err))) || '';
          if (/expired/i.test(errMsg) || /authentication token required/i.test(errMsg)) {
            console.log('🔁 Detected expired/invalid token. Attempting token refresh...');
            const newToken = await tryRefreshToken();
            if (newToken) {
              console.log('🔑 Token refreshed. Reconnecting WebSocket...');
              // cleanup previous instance and listeners then reconnect
              if (unsubConnect) unsubConnect();
              if (unsubDisconnect) unsubDisconnect();
              if (unsubConnectError) unsubConnectError();
              websocketClient.disconnect();
              connectionAttempted.current = false; // allow a new attempt
              // small delay to ensure socket fully closed
              setTimeout(() => startConnection(newToken), 200);
              return;
            } else {
              console.warn('⚠️ Token refresh failed — forcing logout');
              // let axios interceptor or your AuthContext handle redirect; but clear local storage
              localStorage.removeItem('accessToken');
              setConnectionError('Authentication expired. Please log in again.');
              setIsReady(true);
              return;
            }
          }

          // generic error
          setConnectionError(errMsg || 'Failed to connect to server');
          setIsReady(true);
          if (connectionTimeout.current) {
            clearTimeout(connectionTimeout.current);
          }
        };

        // subscribe using websocketClient API
        unsubConnect = websocketClient.on('connect', handleConnect);
        unsubDisconnect = websocketClient.on('disconnect', handleDisconnect);
        unsubConnectError = websocketClient.on('connect_error', handleConnectError);

        // if the wrapper exposes isConnected
        if (websocketClient.isConnected && websocketClient.isConnected()) {
          setIsConnected(true);
          if (connectionTimeout.current) {
            clearTimeout(connectionTimeout.current);
          }
        }
      } catch (error) {
        console.error('❌ Error during WebSocket setup:', error);
        setConnectionError(error.message || 'Failed to initialize WebSocket');
        setIsReady(true);
        if (connectionTimeout.current) {
          clearTimeout(connectionTimeout.current);
        }
      }
    };

    // start initial connection attempt
    startConnection(token);

    // cleanup
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      if (connectionTimeout.current) {
        clearTimeout(connectionTimeout.current);
      }
      if (unsubConnect) unsubConnect();
      if (unsubDisconnect) unsubDisconnect();
      if (unsubConnectError) unsubConnectError();
      connectionAttempted.current = false;
      websocketClient.disconnect();
      setIsReady(false);
      setIsConnected(false);
      setConnectionError(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, isLoading]);

  const value = {
    isConnected,
    isReady,
    connectionError,
    socket: websocketClient,
  };

  if (!isReady && isAuthenticated) {
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
          <div>Initializing connection...</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            If this takes too long, check your server connection
          </div>
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
          maxWidth: '400px'
        }}>
          <strong>⚠️ Connection Error:</strong> {connectionError}
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
