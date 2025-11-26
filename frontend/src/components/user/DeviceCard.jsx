// frontend/src/components/user/DeviceCard.jsx
import { AlertTriangle, Clock, Droplets, Thermometer, TrendingUp, Wind } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDeviceData } from '../../hooks/useDeviceData';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatRelativeTime } from '../../utils/helpers';
import SensorGauge from './SensorGauge';

export default function DeviceCard({ device }) {
  const { getDeviceData } = useDeviceData();
  const { socket, isConnected } = useWebSocket();

  // Get real-time data for this device - THIS WILL UPDATE AUTOMATICALLY!
  const data = getDeviceData(device.MAC);

  // Subscribe to device when component mounts
  useEffect(() => {
    if (isConnected && socket) {
      const success = socket.subscribeToDevice(device.MAC);
      if (success) {
        console.log(`✅ DeviceCard: Subscribed to ${device.MAC}`);
      }
    }
  }, [device.MAC, socket, isConnected]);

  // Check if device is online (data received within last 5 minutes)
  const isOnline = () => {
    if (!data?.timestamp) return false;
    const age = Date.now() - new Date(data.timestamp).getTime();
    return age < 5 * 60 * 1000;
  };

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <div className="card-body">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="card-title text-lg">{device.deviceName || device.MAC}</h2>
            <p className="text-sm text-gray-500 font-mono">{device.MAC}</p>
          </div>
          <div className={`badge ${isOnline() ? 'badge-success' : 'badge-ghost'} gap-2`}>
            <div
              className={`w-2 h-2 rounded-full ${isOnline() ? 'bg-white animate-pulse' : 'bg-gray-400'
                }`}
            ></div>
            {isOnline() ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Sensor Data Display */}
        {data ? (
          <div className="space-y-4">
            {/* Temperature */}
            <SensorGauge
              icon={<Thermometer className="h-5 w-5" />}
              label="Temperature"
              value={data.temperature}
              unit="°C"
              type="temperature"
              max={50}
            />

            {/* Humidity */}
            <SensorGauge
              icon={<Droplets className="h-5 w-5" />}
              label="Humidity"
              value={data.humidity}
              unit="%"
              type="humidity"
              max={100}
            />

            {/* Gas Level */}
            <SensorGauge
              icon={<Wind className="h-5 w-5" />}
              label="Gas Level"
              value={data.gas}
              unit="ppm"
              type="gas"
              max={1000}
            />

            {/* Alert Indicator */}
            {data.alertTriggered && (
              <div className="alert alert-warning py-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Alert triggered</span>
              </div>
            )}

            {/* Timestamp */}
            {data.timestamp && (
              <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t">
                <Clock className="h-4 w-4" />
                <span>Updated {formatRelativeTime(data.timestamp)}</span>
              </div>
            )}
          </div>
        ) : (
          /* Waiting for Data State */
          <div className="text-center py-8 text-gray-500">
            <div className="loading loading-spinner loading-md mb-2"></div>
            <p className="text-sm">Waiting for data...</p>
            <p className="text-xs mt-1 text-gray-400">
              Device: {device.MAC}
            </p>
          </div>
        )}

        {/* View Details Button */}
        <div className="card-actions justify-end mt-4">
          <Link
            to={`/dashboard/device/${device.MAC}`}
            className="btn btn-primary btn-sm gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
