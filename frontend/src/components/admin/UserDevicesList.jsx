// =====================================================
// frontend/src/components/admin/UserDevicesList.jsx
import { Clock, MapPin, Monitor, Wifi, WifiOff } from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';

export default function UserDevicesList({ devices }) {
  if (!devices || devices.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-xs mx-auto">
          <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Aucun appareil assigné</h3>
          <p className="text-sm text-gray-400">
            Cet utilisateur n'a aucun appareil assigné.
          </p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Wifi className="h-4 w-4 text-success" />;
      case 'inactive':
        return <WifiOff className="h-4 w-4 text-gray-400" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-error" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'inactive':
        return 'badge-warning';
      case 'offline':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const isDeviceOnline = (device) => {
    if (!device.lastSeen) return false;
    const lastSeen = new Date(device.lastSeen);
    const now = new Date();
    const diffMinutes = (now - lastSeen) / (1000 * 60);
    return diffMinutes < 5; // Consider online if seen in last 5 minutes
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
      {devices.map((device) => {
        const online = isDeviceOnline(device);
        const status = online ? 'online' : (device.status || 'offline');

        return (
          <div
            key={device.MAC}
            className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 border border-base-300"
          >
            <div className="card-body p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {getStatusIcon(status)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="card-title text-base sm:text-lg font-semibold truncate"
                      title={device.deviceName || device.MAC}
                    >
                      {device.deviceName || device.MAC}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono truncate mt-0.5">
                      {device.MAC}
                    </p>
                  </div>
                </div>
                <span className={`badge badge-sm sm:badge-md ${getStatusColor(status)} flex-shrink-0 ml-2`}>
                  {status}
                </span>
              </div>

              {/* Device Details */}
              <div className="space-y-2 sm:space-y-3 text-sm">
                {/* Location */}
                {device.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate" title={device.location}>
                      {device.location}
                    </span>
                  </div>
                )}

                {/* Last Seen */}
                {device.lastSeen && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="flex-1">
                      Dernière vue : <span className="font-medium">{formatRelativeTime(device.lastSeen)}</span>
                    </span>
                  </div>
                )}

                {/* Additional Info */}
                {device.ipAddress && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-xs font-mono bg-base-200 px-2 py-1 rounded">
                      IP: {device.ipAddress}
                    </span>
                  </div>
                )}

                {/* Online Indicator */}
                <div className="flex items-center gap-2 pt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${online ? 'bg-success animate-pulse' : 'bg-gray-400'
                      }`}
                  />
                  <span className="text-xs text-gray-500">
                    {online ? 'Actuellement en ligne' : 'Actuellement hors ligne'}
                  </span>
                </div>
              </div>

              {/* Optional: Action Buttons */}
              <div className="card-actions justify-end mt-4 pt-3 border-t border-base-300">
                <button className="btn btn-xs btn-ghost">Voir les détails</button>
                <button className="btn btn-xs btn-primary">Gérer</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
