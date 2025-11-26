
// =====================================================

// frontend/src/components/user/AlertPanel.jsx
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import { formatDate, getAlertBadgeClass } from '../../utils/helpers';

export default function AlertPanel() {
  const { alerts, acknowledgeAlert, unacknowledgedCount } = useAlerts();

  const unacknowledged = alerts.filter(a => !a.acknowledged).slice(0, 5);

  if (unacknowledgedCount === 0) {
    return null;
  }

  return (
    <div className="alert shadow-lg bg-warning/10 border-l-4 border-warning">
      <div className="flex-1">
        <div className="flex items-start gap-3 w-full">
          <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">
              Active Alerts ({unacknowledgedCount})
            </h3>
            <div className="space-y-2">
              {unacknowledged.map((alert) => (
                <div
                  key={alert._id}
                  className="flex items-start justify-between p-3 bg-base-100 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold text-sm">{alert.MAC}</span>
                      <span className={`badge badge-sm ${getAlertBadgeClass(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="badge badge-sm badge-outline">
                        {alert.alertType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(alert.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert._id)}
                    className="btn btn-sm btn-ghost gap-1"
                    title="Acknowledge"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
