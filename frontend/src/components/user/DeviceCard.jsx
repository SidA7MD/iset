// frontend/src/components/user/DeviceCard.jsx
import { ChevronRight, Droplets, Radio, Thermometer, Wind } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDeviceData } from '../../hooks/useDeviceData';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatRelativeTime } from '../../utils/helpers';

export default function DeviceCard({ device }) {
  const { getDeviceData, getDeviceStatus, isDeviceOnline } = useDeviceData();
  const { socket, isConnected } = useWebSocket();

  // Get real-time data for this device
  const data = getDeviceData(device.MAC);
  const realtimeStatus = getDeviceStatus(device.MAC);

  // Subscribe to device when component mounts
  useEffect(() => {
    if (isConnected && socket) {
      console.log(`📱 Subscribing to device: ${device.MAC}`);
      socket.emit('device:subscribe', { MAC: device.MAC });
    }
  }, [device.MAC, socket, isConnected]);

  // Check if device is online - use real-time status if available, otherwise check device.lastSeen
  const checkOnline = () => {
    // First check real-time status from WebSocket
    if (isDeviceOnline(device.MAC)) return true;
    
    // Check real-time data timestamp
    if (data?.timestamp) {
      const age = Date.now() - new Date(data.timestamp).getTime();
      if (age < 5 * 60 * 1000) return true;
    }
    
    // Fall back to device's lastSeen from database
    if (device.lastSeen) {
      const age = Date.now() - new Date(device.lastSeen).getTime();
      return age < 5 * 60 * 1000;
    }
    
    return false;
  };

  const online = checkOnline();

  // Sensor row component
  const SensorRow = ({ icon: Icon, value, unit, color, label }) => (
    <div className="flex items-center justify-between py-2 border-b border-base-300/50 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded ${color}`}>
          <Icon className="h-3 w-3 text-white" />
        </div>
        <span className="text-xs text-base-content/60">{label}</span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-sm font-bold text-base-content">
          {value !== null && value !== undefined ? value : '--'}
        </span>
        <span className="text-[10px] text-base-content/40">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className={`bg-base-200 border rounded-xl overflow-hidden shadow-sm
                    hover:shadow-lg hover:scale-[1.02] transition-all duration-300
                    ${online ? 'border-base-300' : 'border-base-300/50'}`}>

      <div className="p-4">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Device icon */}
            <div className={`p-2 rounded-xl ${online 
              ? 'bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/20' 
              : 'bg-base-300'}`}>
              <Radio className={`h-5 w-5 ${online ? 'text-white' : 'text-base-content/30'}`} />
            </div>
            
            <div>
              <h2 className="text-sm font-bold text-base-content">
                {device.deviceName || 'Appareil'}
              </h2>
              <p className="text-[10px] text-base-content/40 font-mono">
                {device.MAC}
              </p>
            </div>
          </div>

          {/* Online status */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium
            ${online 
              ? 'bg-emerald-500/15 text-emerald-400' 
              : 'bg-base-300/50 text-base-content/40'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-base-content/30'}`} />
            {online ? 'En ligne' : 'Hors ligne'}
          </div>
        </div>

        {/* ── Sensor Data ────────────────────────────────────────── */}
        <div className="bg-base-100/50 rounded-lg px-3 py-1 mb-3">
          {online ? (
            <>
              <SensorRow 
                icon={Thermometer}
                value={data?.temperature?.toFixed(1)}
                unit="°C"
                color="bg-orange-500"
                label="Température"
              />
              <SensorRow 
                icon={Droplets}
                value={data?.humidity?.toFixed(1)}
                unit="%"
                color="bg-blue-500"
                label="Humidité"
              />
              <SensorRow 
                icon={Wind}
                value={data?.gas?.toFixed(0)}
                unit="ppm"
                color="bg-emerald-500"
                label="Niveau de Gaz"
              />
            </>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs text-base-content/40 italic">
                Appareil hors ligne
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          {/* Timestamp */}
          {online && data?.timestamp ? (
            <span className="text-[10px] text-base-content/30">
              Mis à jour {formatRelativeTime(data.timestamp)}
            </span>
          ) : (
            <span></span>
          )}
          
          {/* Details link */}
          <Link
            to={`/dashboard/device/${device.MAC}`}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 
                     transition-colors font-medium"
          >
            Voir détails
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
