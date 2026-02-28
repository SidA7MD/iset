// =====================================================
// frontend/src/components/admin/UserDevicesList.jsx
import {
  ArrowUpRight,
  Clock,
  HardDrive,
  MapPin,
  Monitor,
  Settings,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/helpers';

export default function UserDevicesList({ devices }) {
  const navigate = useNavigate();

  if (!devices || devices.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="max-w-xs mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-base-300/60 flex items-center justify-center mx-auto mb-4">
            <Monitor className="h-6 w-6 text-base-content/30" />
          </div>
          <h3 className="text-sm font-semibold text-base-content/60 mb-1">Aucun appareil</h3>
          <p className="text-xs text-base-content/35 leading-relaxed">
            Aucun appareil n'est enregistré dans le système pour le moment.
          </p>
        </div>
      </div>
    );
  }

  const isDeviceOnline = (device) => {
    if (!device.lastSeen) return false;
    return (Date.now() - new Date(device.lastSeen).getTime()) < 5 * 60 * 1000;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {devices.map((device) => {
        const online = isDeviceOnline(device);

        return (
          <div
            key={device.MAC}
            className="group relative bg-base-100 border border-base-300 rounded-xl overflow-hidden hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-200"
          >
            {/* Top accent line */}
            <div className={`h-0.5 ${online ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-base-300'}`} />

            <div className="p-4 sm:p-5">
              {/* Header row */}
              <div className="flex items-start gap-3 mb-4">
                {/* Device icon with status dot */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center">
                    <HardDrive className="w-4.5 h-4.5 text-base-content/40" />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-base-100 ${online ? 'bg-emerald-500' : 'bg-base-content/20'}`} />
                </div>

                {/* Name + MAC */}
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-sm font-semibold text-base-content truncate leading-tight"
                    title={device.deviceName || device.MAC}
                  >
                    {device.deviceName || device.MAC}
                  </h3>
                  <p className="text-[11px] font-mono text-base-content/35 truncate mt-0.5">
                    {device.MAC}
                  </p>
                </div>

                {/* Status badge */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium flex-shrink-0 ${
                  online
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-base-200 text-base-content/40'
                }`}>
                  {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {online ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>

              {/* Info rows */}
              <div className="space-y-2.5 mb-4">
                {/* Location */}
                {device.location && (
                  <div className="flex items-center gap-2.5 text-xs text-base-content/50">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-base-content/30" />
                    <span className="truncate" title={device.location}>
                      {device.location}
                    </span>
                  </div>
                )}

                {/* Last Seen */}
                {device.lastSeen && (
                  <div className="flex items-center gap-2.5 text-xs text-base-content/50">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0 text-base-content/30" />
                    <span>
                      Vu <span className="font-medium text-base-content/70">{formatRelativeTime(device.lastSeen)}</span>
                    </span>
                  </div>
                )}

                {/* Assigned To */}
                {device.assignedTo && (
                  <div className="flex items-center gap-2.5 text-xs text-base-content/50">
                    <User className="h-3.5 w-3.5 flex-shrink-0 text-base-content/30" />
                    <span className="truncate">
                      <span className="font-medium text-base-content/70">
                        {device.assignedTo.username || 'Utilisateur'}
                      </span>
                    </span>
                  </div>
                )}

                {!device.assignedTo && (
                  <div className="flex items-center gap-2.5 text-xs">
                    <User className="h-3.5 w-3.5 flex-shrink-0 text-amber-500/50" />
                    <span className="text-amber-500/70 font-medium">Non assigné</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-base-300/60">
                <button
                  onClick={() => navigate(`/admin/devices/${device.MAC}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                             text-base-content/60 bg-base-200/60 hover:bg-base-300 hover:text-base-content
                             transition-all duration-150 active:scale-[0.97]"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Détails
                </button>
                <button
                  onClick={() => navigate(`/admin/devices?search=${encodeURIComponent(device.MAC)}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                             text-white bg-cyan-600 hover:bg-cyan-500
                             transition-all duration-150 active:scale-[0.97]"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Gérer
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
