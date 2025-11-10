// frontend/src/contexts/DeviceDataContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from './WebSocketContext';

// ✅ Export the context so it can be imported directly if needed
export const DeviceDataContext = createContext(null);

// In-memory store for device data
const deviceDataStore = new Map();

export const DeviceDataProvider = ({ children }) => {
  const { socket, isConnected } = useWebSocket();
  const [, forceUpdate] = useState({}); // trigger re-renders

  useEffect(() => {
    if (!isConnected) return;

    // Handle incoming sensor data
    const handleSensorData = (data) => {
      console.log('📊 Received sensor data:', data);
      deviceDataStore.set(data.MAC, {
        ...data,
        receivedAt: Date.now(),
      });
      forceUpdate({}); // force re-render
    };

    // Handle device alerts
    const handleAlert = (alert) => {
      console.log('⚠️ Alert received:', alert);
      // Optional: store alerts here if needed
    };

    // Subscribe to WebSocket events
    const unsubSensorData = socket.on('sensor:data', handleSensorData);
    const unsubAlert = socket.on('device:alert', handleAlert);

    // Cleanup subscriptions
    return () => {
      unsubSensorData();
      unsubAlert();
    };
  }, [isConnected, socket]);

  // Get data for a specific device
  const getDeviceData = (MAC) => deviceDataStore.get(MAC) || null;

  // Get data for all devices
  const getAllDeviceData = () =>
    Array.from(deviceDataStore.entries()).map(([MAC, data]) => ({
      MAC,
      ...data,
    }));

  // Clear data for a device or all devices
  const clearDeviceData = (MAC) => {
    if (MAC) {
      deviceDataStore.delete(MAC);
    } else {
      deviceDataStore.clear();
    }
    forceUpdate({});
  };

  const value = { getDeviceData, getAllDeviceData, clearDeviceData };

  return (
    <DeviceDataContext.Provider value={value}>
      {children}
    </DeviceDataContext.Provider>
  );
};

// Custom hook for consuming the context
export const useDeviceData = () => {
  const context = useContext(DeviceDataContext);
  if (!context) throw new Error('useDeviceData must be used within DeviceDataProvider');
  return context;
};
