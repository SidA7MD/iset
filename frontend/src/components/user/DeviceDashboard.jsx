// frontend/src/components/user/DeviceDashboard.jsx
// Updated dashboard component with proper real-time handling and responsive design

import { Activity, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { deviceApi } from '../../api/deviceApi';
import { useDeviceData } from '../../hooks/useDeviceData';
import { useWebSocket } from '../../hooks/useWebSocket';
import LoadingSpinner from '../common/LoadingSpinner';
import DeviceCard from './DeviceCard';

export default function DeviceDashboard() {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getDeviceData } = useDeviceData();
  const { socket, isConnected, isReady } = useWebSocket();

  // Fetch devices on mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Setup WebSocket listeners when socket is ready
  useEffect(() => {
    if (!isReady || !socket) {
      console.log('⏳ Waiting for WebSocket to be ready...');
      return;
    }

    console.log('🎯 Setting up WebSocket listeners for DeviceDashboard');

    // Listen for alerts
    const unsubAlerts = socket.on('device:alert', (alert) => {
      console.log('⚠️ Alert received:', alert);
      setAlerts((prev) => [alert, ...prev].slice(0, 10));
      toast.error(`Alert: ${alert.message}`, {
        duration: 5000,
        icon: '⚠️',
      });
    });

    // Listen for device status changes
    const unsubStatus = socket.on('device:status', (data) => {
      console.log('🔄 Device status changed:', data);
      setDevices((prev) =>
        prev.map((device) =>
          device.MAC === data.MAC
            ? { ...device, status: data.status }
            : device
        )
      );
    });

    // Listen for device assignment changes
    const unsubAssignment = socket.on('user:device-assigned', (data) => {
      console.log('➕ New device assigned:', data);
      fetchDevices(); // Refresh device list
    });

    // Cleanup all listeners on unmount
    return () => {
      console.log('🧹 Cleaning up DeviceDashboard WebSocket listeners');
      unsubAlerts();
      unsubStatus();
      unsubAssignment();
    };
  }, [isReady, socket]);

  // Subscribe to devices when they are loaded and socket is ready
  useEffect(() => {
    if (!isReady || !socket || devices.length === 0) {
      return;
    }

    console.log('📡 Subscribing to devices...');

    // Subscribe to each device
    devices.forEach((device) => {
      const success = socket.subscribeToDevice(device.MAC);
      if (success) {
        console.log(`🔔 Subscribed to device: ${device.MAC}`);
      } else {
        console.warn(`⚠️ Failed to subscribe to device: ${device.MAC}`);
      }
    });
  }, [devices, isReady, socket]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceApi.getMyDevices();
      const fetchedDevices = response.data.devices;
      setDevices(fetchedDevices);
      console.log(`✅ Loaded ${fetchedDevices.length} devices`);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading devices..." />;
  }

  const onlineDevices = devices.filter((d) => {
    const data = getDeviceData(d.MAC);
    if (!data) return false;
    const age = Date.now() - new Date(data.timestamp).getTime();
    return age < 5 * 60 * 1000; // Online if data within last 5 minutes
  }).length;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Device Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Real-time monitoring of your assigned devices
            </p>
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-error'}`}
            ></div>
            <span className="text-xs sm:text-sm text-gray-500">
              {isConnected ? 'Real-time updates active' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Total Devices Stat */}
        <div className="stat bg-base-100 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="stat-figure text-primary">
            <Activity className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div className="stat-title text-sm sm:text-base">Total Devices</div>
          <div className="stat-value text-lg sm:text-2xl md:text-3xl text-primary">{devices.length}</div>
          <div className="stat-desc text-xs sm:text-sm">Assigned to you</div>
        </div>

        {/* Online Devices Stat */}
        <div className="stat bg-base-100 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="stat-figure text-success">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-success animate-pulse"></div>
          </div>
          <div className="stat-title text-sm sm:text-base">Online</div>
          <div className="stat-value text-lg sm:text-2xl md:text-3xl text-success">{onlineDevices}</div>
          <div className="stat-desc text-xs sm:text-sm">Active connections</div>
        </div>

        {/* Active Alerts Stat */}
        <div className="stat bg-base-100 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="stat-figure text-warning">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div className="stat-title text-sm sm:text-base">Active Alerts</div>
          <div className="stat-value text-lg sm:text-2xl md:text-3xl text-warning">{alerts.length}</div>
          <div className="stat-desc text-xs sm:text-sm">Requiring attention</div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="alert alert-warning shadow-lg rounded-xl sm:rounded-2xl">
          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base">Active Alerts ({alerts.length})</h3>
                <div className="text-xs sm:text-sm">
                  Latest: {alerts[0].message} - {alerts[0].MAC}
                </div>
              </div>
              <button
                className="btn btn-sm btn-warning mt-2 sm:mt-0"
                onClick={() => setAlerts([])}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Devices Grid */}
      {devices.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-base-100 rounded-xl sm:rounded-2xl shadow-lg">
          <p className="text-gray-500 text-lg sm:text-xl">No devices assigned to you</p>
          <p className="text-gray-400 text-sm sm:text-base mt-2">
            Contact your administrator to get devices assigned
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {devices.map((device) => (
            <DeviceCard key={device.MAC} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
