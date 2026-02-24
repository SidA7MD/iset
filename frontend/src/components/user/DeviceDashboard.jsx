// frontend/src/components/user/DeviceDashboard.jsx
// Updated dashboard component with proper real-time handling and responsive design

import { Activity, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { deviceApi } from '../../api/deviceApi';
import { sensorDataApi } from '../../api/sensorDataApi';
import { useDeviceData } from '../../hooks/useDeviceData';
import { useWebSocket } from '../../hooks/useWebSocket';
import LoadingSpinner from '../common/LoadingSpinner';
import DeviceCard from './DeviceCard';

export default function DeviceDashboard() {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getDeviceData, setDeviceData, isDeviceOnline } = useDeviceData();
  const { socket, isConnected } = useWebSocket();

  // Fetch devices on mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Setup WebSocket listeners when socket is ready
  useEffect(() => {
    if (!isConnected || !socket) {
      console.log('⏳ Waiting for WebSocket to be ready...');
      return;
    }

    console.log('🎯 Setting up WebSocket listeners for DeviceDashboard');

    // Listen for alerts
    const handleAlert = (alert) => {
      console.log('⚠️ Alert received:', alert);
      setAlerts((prev) => [alert, ...prev].slice(0, 10));
      toast.error(`Alerte : ${alert.message}`, {
        duration: 5000,
        icon: '⚠️',
      });
    };

    // Listen for device status changes
    const handleStatus = (data) => {
      console.log('🔄 Device status changed:', data);
      setDevices((prev) =>
        prev.map((device) =>
          device.MAC === data.MAC
            ? { ...device, status: data.status }
            : device
        )
      );
    };

    // Listen for device assignment changes
    const handleAssignment = (data) => {
      console.log('➕ New device assigned:', data);
      fetchDevices(); // Refresh device list
    };

    socket.on('device:alert', handleAlert);
    socket.on('device:status', handleStatus);
    socket.on('user:device-assigned', handleAssignment);

    // Cleanup all listeners on unmount
    return () => {
      console.log('🧹 Cleaning up DeviceDashboard WebSocket listeners');
      socket.off('device:alert', handleAlert);
      socket.off('device:status', handleStatus);
      socket.off('user:device-assigned', handleAssignment);
    };
  }, [isConnected, socket]);

  // Subscribe to devices when they are loaded and socket is ready
  useEffect(() => {
    if (!isConnected || !socket || devices.length === 0) {
      return;
    }

    console.log('📡 Subscribing to devices...');

    devices.forEach((device) => {
      console.log(`🔔 Subscribing to device: ${device.MAC}`);
      socket.emit('device:subscribe', { MAC: device.MAC });
    });
  }, [devices, isConnected, socket]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceApi.getMyDevices();
      const fetchedDevices = response.data.devices;
      setDevices(fetchedDevices);
      console.log(`✅ Loaded ${fetchedDevices.length} devices`);

      // Fetch latest sensor data for each device
      const latestDataPromises = fetchedDevices.map(async (device) => {
        try {
          const latestResponse = await sensorDataApi.getLatest(device.MAC);
          if (latestResponse.data) {
            setDeviceData(device.MAC, latestResponse.data);
            console.log(`📊 Loaded latest data for ${device.MAC}`);
          }
        } catch (error) {
            // Device may not have any data yet, this is fine
            console.log(`ℹ️ No data yet for ${device.MAC}`);
        }
      });

      await Promise.all(latestDataPromises);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Échec du chargement des appareils');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des appareils..." />;
  }

  const onlineDevices = devices.filter((d) => {
    // Use the isDeviceOnline function from hook or check lastSeen
    if (isDeviceOnline(d.MAC)) return true;
    
    const data = getDeviceData(d.MAC);
    if (data?.timestamp) {
      const age = Date.now() - new Date(data.timestamp).getTime();
      return age < 5 * 60 * 1000;
    }
    
    // Fall back to device lastSeen from database
    if (d.lastSeen) {
      const age = Date.now() - new Date(d.lastSeen).getTime();
      return age < 5 * 60 * 1000;
    }
    
    return false;
  }).length;

  const metricCards = [
    {
      icon: Activity,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
      label: 'Total des appareils',
      value: devices.length,
      sub: 'Assignés à vous',
      subColor: 'text-base-content/40',
    },
    {
      icon: Wifi,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      label: 'En ligne',
      value: onlineDevices,
      sub: 'Connexions actives',
      subColor: 'text-emerald-400',
    },
    {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      label: 'Alertes actives',
      value: alerts.length,
      sub: alerts.length > 0 ? 'Nécessite attention' : 'Tout est normal',
      subColor: alerts.length > 0 ? 'text-amber-400' : 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-base-content tracking-tight">Tableau de bord des appareils</h1>
          <p className="text-sm text-base-content/40 mt-0.5">
            Surveillance en temps réel de vos appareils assignés
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-base-content/30" />
          )}
          <span className={`text-xs ${isConnected ? 'text-emerald-400' : 'text-base-content/30'}`}>
            {isConnected ? 'Mises à jour en direct' : 'Connexion…'}
          </span>
          {isConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="metric-card">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-base-content tracking-tight">{card.value}</div>
              <div className="section-label mt-2">{card.label}</div>
              <div className={`text-xs mt-1 ${card.subColor}`}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Active Alerts banner */}
      {alerts.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-500/20
                        bg-amber-500/8 text-amber-300">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Alertes actives ({alerts.length})</p>
            <p className="text-xs text-amber-300/70 mt-0.5 truncate">
              Dernière : {alerts[0].message} — {alerts[0].MAC}
            </p>
          </div>
          <button
            onClick={() => setAlerts([])}
            className="text-xs text-amber-300/60 hover:text-amber-300 transition-colors"
          >
            Tout ignorer
          </button>
        </div>
      )}

      {/* Devices Grid */}
      {devices.length === 0 ? (
        <div className="text-center py-16 bg-base-200 border border-base-300 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-base-300 flex items-center justify-center mx-auto mb-3">
            <Activity className="h-6 w-6 text-base-content/20" />
          </div>
          <p className="text-sm font-medium text-base-content/50">Aucun appareil assigné</p>
          <p className="text-xs text-base-content/30 mt-1">
            Contactez votre administrateur pour obtenir des appareils
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {devices.map((device) => (
            <DeviceCard key={device.MAC} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
