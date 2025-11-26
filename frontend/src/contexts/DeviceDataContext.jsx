// frontend/src/contexts/DeviceDataContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useWebSocket } from './WebSocketContext';

export const DeviceDataContext = createContext(null);

export const DeviceDataProvider = ({ children }) => {
  // Store device data in state: { MAC: { temperature, humidity, gas, timestamp, ... } }
  const [deviceData, setDeviceData] = useState({});
  const { socket, isConnected, isReady } = useWebSocket();

  // Listen for sensor data updates
  useEffect(() => {
    if (!isReady || !socket) {
      console.log('⏳ DeviceDataContext: Waiting for socket to be ready...');
      return;
    }

    console.log('📡 DeviceDataContext: Setting up sensor:data listener');

    // THIS IS THE KEY LISTENER - It updates the UI!
    const unsubscribeSensorData = socket.on('sensor:data', (data) => {
      console.log('📊 Sensor data received:', data);

      // Update device data in state
      setDeviceData((prev) => ({
        ...prev,
        [data.MAC]: {
          MAC: data.MAC,
          temperature: data.temperature,
          humidity: data.humidity,
          gas: data.gas,
          timestamp: data.timestamp,
          alertTriggered: data.alertTriggered || false,
          alertTypes: data.alertTypes || [],
        },
      }));
    });

    // Also listen for alerts (optional)
    const unsubscribeAlert = socket.on('device:alert', (alert) => {
      console.log('⚠️ Alert received in DeviceDataContext:', alert);
      // You can update alert state here if needed
    });

    // Cleanup listeners on unmount
    return () => {
      console.log('🧹 DeviceDataContext: Cleaning up listeners');
      unsubscribeSensorData();
      unsubscribeAlert();
    };
  }, [isReady, socket]);

  // Get data for a specific device
  const getDeviceData = useCallback((MAC) => {
    return deviceData[MAC] || null;
  }, [deviceData]);

  // Get all device data
  const getAllDeviceData = useCallback(() => {
    return Object.values(deviceData);
  }, [deviceData]);

  // Clear data for a device
  const clearDeviceData = useCallback((MAC) => {
    setDeviceData((prev) => {
      const newData = { ...prev };
      delete newData[MAC];
      return newData;
    });
  }, []);

  // Clear all data
  const clearAllData = useCallback(() => {
    setDeviceData({});
  }, []);

  const value = {
    deviceData,
    getDeviceData,
    getAllDeviceData,
    clearDeviceData,
    clearAllData,
  };

  return (
    <DeviceDataContext.Provider value={value}>
      {children}
    </DeviceDataContext.Provider>
  );
};

export const useDeviceData = () => {
  const context = useContext(DeviceDataContext);
  if (!context) {
    throw new Error('useDeviceData must be used within DeviceDataProvider');
  }
  return context;
};
