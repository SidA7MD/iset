// =====================================================
// frontend/src/hooks/useDeviceData.js
// FIXED: Uses proper subscription pattern to notify ALL components

import { useCallback, useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';

// In-memory store for real-time device data (shared across hook instances)
const deviceDataStore = new Map();
// In-memory store for device status (online/offline)
const deviceStatusStore = new Map();

// Subscribers that get notified when data changes
const subscribers = new Set();

// Notify all subscribers when data changes
function notifySubscribers() {
  console.log(`🔔 Notifying ${subscribers.size} subscribers of data change`);
  subscribers.forEach((callback) => callback());
}

// Track if listeners are already set up (only need one set of listeners)
let listenersSetUp = false;
let currentSocket = null;

export function useDeviceData() {
  const [updateCount, setUpdateCount] = useState(0);
  const { socket, isConnected } = useWebSocket();

  // Subscribe this component to data changes
  useEffect(() => {
    const forceUpdate = () => setUpdateCount((c) => c + 1);
    subscribers.add(forceUpdate);
    console.log(`➕ Component subscribed, total: ${subscribers.size}`);
    
    return () => {
      subscribers.delete(forceUpdate);
      console.log(`➖ Component unsubscribed, total: ${subscribers.size}`);
    };
  }, []);

  // Set up socket listeners (only once globally)
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('⏳ useDeviceData: Waiting for socket connection...');
      return;
    }

    // If listeners already set up for this socket, skip
    if (listenersSetUp && currentSocket === socket) {
      console.log('✅ useDeviceData: Listeners already set up for this socket');
      return;
    }

    // Clean up old listeners if socket changed
    if (currentSocket && currentSocket !== socket) {
      console.log('🔄 useDeviceData: Socket changed, resetting listeners');
      currentSocket.off('sensor:data');
      currentSocket.off('device:status');
    }

    console.log('📡 useDeviceData: Setting up global sensor:data and device:status listeners');

    // Listen for real-time sensor data
    const handleSensorData = (data) => {
      console.log('📊 Received sensor data:', data);

      const now = Date.now();
      
      // Store sensor data in memory
      deviceDataStore.set(data.MAC, {
        ...data,
        receivedAt: now,
      });

      // Also update device status to online
      deviceStatusStore.set(data.MAC, {
        isOnline: true,
        lastSeen: now,
      });

      // Notify ALL components using this hook
      notifySubscribers();
    };

    // Listen for device status updates
    const handleDeviceStatus = (data) => {
      console.log('📶 Device status update:', data);
      
      deviceStatusStore.set(data.MAC, {
        isOnline: data.status?.isOnline ?? true,
        lastSeen: data.status?.lastSeen ? new Date(data.status.lastSeen).getTime() : Date.now(),
      });

      // Notify ALL components using this hook
      notifySubscribers();
    };

    // Subscribe to WebSocket events
    socket.on('sensor:data', handleSensorData);
    socket.on('device:status', handleDeviceStatus);
    
    listenersSetUp = true;
    currentSocket = socket;

    // Note: We don't clean up listeners on component unmount
    // because the listeners are global and should persist
  }, [socket, isConnected]);

  const getDeviceData = useCallback((MAC) => {
    return deviceDataStore.get(MAC) || null;
  }, [updateCount]);

  const getDeviceStatus = useCallback((MAC) => {
    return deviceStatusStore.get(MAC) || { isOnline: false, lastSeen: null };
  }, [updateCount]);

  // Check if device is online (seen within last 5 minutes)
  const isDeviceOnline = useCallback((MAC) => {
    const status = deviceStatusStore.get(MAC);
    if (!status?.lastSeen) return false;
    
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return status.lastSeen > fiveMinutesAgo;
  }, [updateCount]);

  const getAllDeviceData = useCallback(() => {
    return Array.from(deviceDataStore.entries()).map(([MAC, data]) => ({
      MAC,
      ...data,
    }));
  }, [updateCount]);

  const clearDeviceData = useCallback((MAC) => {
    if (MAC) {
      deviceDataStore.delete(MAC);
      deviceStatusStore.delete(MAC);
    } else {
      deviceDataStore.clear();
      deviceStatusStore.clear();
    }
    notifySubscribers();
  }, []);

  // Set device data programmatically (for initial load from API)
  const setDeviceData = useCallback((MAC, data) => {
    const now = Date.now();
    
    deviceDataStore.set(MAC, {
      MAC,
      temperature: data.temperature,
      humidity: data.humidity,
      gas: data.gas,
      timestamp: data.timestamp,
      alertTriggered: data.alertTriggered || false,
      alertTypes: data.alertTypes || [],
      receivedAt: now,
    });

    // Also update device status based on timestamp
    const dataAge = now - new Date(data.timestamp).getTime();
    const isOnline = dataAge < 5 * 60 * 1000; // 5 minutes
    
    deviceStatusStore.set(MAC, {
      isOnline,
      lastSeen: new Date(data.timestamp).getTime(),
    });

    notifySubscribers();
  }, []);

  return {
    getDeviceData,
    getDeviceStatus,
    isDeviceOnline,
    getAllDeviceData,
    clearDeviceData,
    setDeviceData,
  };
}
