// frontend/src/contexts/DeviceDataContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useWebSocket } from './WebSocketContext';

export const DeviceDataContext = createContext(null);

export const DeviceDataProvider = ({ children }) => {
  // Store device data in state: { MAC: { temperature, humidity, gas, timestamp, lastSeen, ... } }
  const [deviceData, setDeviceData] = useState({});
  // Track device status: { MAC: { isOnline, lastSeen } }
  const [deviceStatus, setDeviceStatus] = useState({});
  const { socket, isConnected, isReady } = useWebSocket();

  // Listen for sensor data and status updates
  useEffect(() => {
    if (!isReady || !socket) {
      console.log('⏳ DeviceDataContext: Waiting for socket to be ready...');
      return;
    }

    console.log('📡 DeviceDataContext: Setting up sensor:data and device:status listeners');

    // Listen for sensor data updates
    const unsubscribeSensorData = socket.on('sensor:data', (data) => {
      console.log('📊 Sensor data received:', data);

      // Update device data in state with lastSeen
      setDeviceData((prev) => ({
        ...prev,
        [data.MAC]: {
          MAC: data.MAC,
          temperature: data.temperature,
          humidity: data.humidity,
          gas: data.gas,
          timestamp: data.timestamp,
          lastSeen: new Date().toISOString(),
          alertTriggered: data.alertTriggered || false,
          alertTypes: data.alertTypes || [],
        },
      }));

      // Also update device status to online
      setDeviceStatus((prev) => ({
        ...prev,
        [data.MAC]: {
          isOnline: true,
          lastSeen: new Date().toISOString(),
        },
      }));
    });

    // Listen for device status updates
    const unsubscribeStatus = socket.on('device:status', (data) => {
      console.log('📶 Device status update:', data);
      
      setDeviceStatus((prev) => ({
        ...prev,
        [data.MAC]: {
          isOnline: data.status?.isOnline ?? true,
          lastSeen: data.status?.lastSeen || data.timestamp,
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
      unsubscribeStatus();
      unsubscribeAlert();
    };
  }, [isReady, socket]);

  // Get data for a specific device
  const getDeviceData = useCallback((MAC) => {
    return deviceData[MAC] || null;
  }, [deviceData]);

  // Get status for a specific device
  const getDeviceStatus = useCallback((MAC) => {
    return deviceStatus[MAC] || { isOnline: false, lastSeen: null };
  }, [deviceStatus]);

  // Check if device is online (seen within last 5 minutes)
  const isDeviceOnline = useCallback((MAC) => {
    const status = deviceStatus[MAC];
    if (!status?.lastSeen) return false;
    
    const lastSeen = new Date(status.lastSeen).getTime();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return lastSeen > fiveMinutesAgo;
  }, [deviceStatus]);

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
    setDeviceStatus((prev) => {
      const newStatus = { ...prev };
      delete newStatus[MAC];
      return newStatus;
    });
  }, []);

  // Clear all data
  const clearAllData = useCallback(() => {
    setDeviceData({});
    setDeviceStatus({});
  }, []);

  // Manually set device data (from API response)
  const setDeviceDataManual = useCallback((MAC, data) => {
    if (!MAC || !data) return;
    
    setDeviceData((prev) => ({
      ...prev,
      [MAC]: {
        MAC: MAC,
        temperature: data.temperature,
        humidity: data.humidity,
        gas: data.gas,
        timestamp: data.timestamp,
        lastSeen: data.timestamp || new Date().toISOString(),
        alertTriggered: data.alertTriggered || false,
        alertTypes: data.alertTypes || [],
      },
    }));

    // Also update status
    setDeviceStatus((prev) => ({
      ...prev,
      [MAC]: {
        isOnline: true,
        lastSeen: data.timestamp || new Date().toISOString(),
      },
    }));
  }, []);

  const value = {
    deviceData,
    deviceStatus,
    getDeviceData,
    getDeviceStatus,
    isDeviceOnline,
    getAllDeviceData,
    clearDeviceData,
    clearAllData,
    setDeviceDataManual,
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
