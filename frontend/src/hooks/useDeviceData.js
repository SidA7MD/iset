// =====================================================
// frontend/src/hooks/useDeviceData.js
// REPLACE with this version that properly handles real-time updates

import { useEffect, useState } from 'react';
import websocketClient from '../services/websocketClient';

// In-memory store for real-time device data
const deviceDataStore = new Map();

export function useDeviceData() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Listen for real-time sensor data
    const handleSensorData = (data) => {
      console.log('📊 Received sensor data:', data);

      // Store in memory
      deviceDataStore.set(data.MAC, {
        ...data,
        receivedAt: Date.now(),
      });

      // Force component re-render
      forceUpdate({});
    };

    // Subscribe to WebSocket events
    websocketClient.on('sensor:data', handleSensorData);

    // Cleanup
    return () => {
      websocketClient.off('sensor:data', handleSensorData);
    };
  }, []);

  const getDeviceData = (MAC) => {
    return deviceDataStore.get(MAC) || null;
  };

  const getAllDeviceData = () => {
    return Array.from(deviceDataStore.entries()).map(([MAC, data]) => ({
      MAC,
      ...data,
    }));
  };

  const clearDeviceData = (MAC) => {
    if (MAC) {
      deviceDataStore.delete(MAC);
    } else {
      deviceDataStore.clear();
    }
    forceUpdate({});
  };

  return {
    getDeviceData,
    getAllDeviceData,
    clearDeviceData,
  };
}
