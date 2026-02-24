// =====================================================
// frontend/src/components/user/SensorGauge.jsx
import React from 'react';
import { getSensorColor } from '../../utils/helpers';
import { getAlertLevel } from '../../utils/thresholds';

export default function SensorGauge({ icon, label, value, unit, type, max }) {
  const hasValue = value !== null && value !== undefined;
  const alertLevel = hasValue ? getAlertLevel(type, value) : 'normal';
  const color = hasValue ? getSensorColor(type, value) : '#9ca3af';
  const percentage = hasValue ? Math.min((value / max) * 100, 100) : 0;
  const displayValue = hasValue ? Number(value).toFixed(1) : null;

  // User-friendly status labels
  const getStatusLabel = () => {
    if (!hasValue) return null;
    switch (alertLevel) {
      case 'critical':
        return { text: 'Critique', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' };
      case 'warning':
        return { text: 'Attention', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' };
      default:
        return { text: 'Normal', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' };
    }
  };

  const status = getStatusLabel();

  const getContainerStyles = () => {
    const baseStyles = "relative overflow-hidden rounded-lg border transition-all duration-200";

    if (!hasValue) {
      return `${baseStyles} bg-gray-50 dark:bg-slate-800/20 border-gray-200 dark:border-slate-600/20`;
    }

    switch (alertLevel) {
      case 'critical':
        return `${baseStyles} bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/10 border-red-300 dark:border-red-500/40`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-300 dark:border-amber-500/40`;
      default:
        return `${baseStyles} bg-white dark:bg-slate-800/40 border-gray-200 dark:border-slate-600/30`;
    }
  };

  return (
    <div className={getContainerStyles()}>
      <div className="px-2.5 py-2">
        {/* Header with label and status */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            {React.cloneElement(icon, {
              className: `h-3 w-3 ${hasValue ? 'text-gray-500 dark:text-slate-400' : 'text-gray-300'}`
            })}
            <span className="font-medium text-gray-600 dark:text-slate-300 text-[10px]">
              {label}
            </span>
          </div>

          {/* Status badge */}
          {status && (
            <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${status.color}`}>
              {status.text}
            </span>
          )}
        </div>

        {/* Value display */}
        <div className="flex items-baseline gap-0.5 mb-1.5">
          {hasValue ? (
            <>
              <span className="font-bold text-gray-900 dark:text-slate-100 text-lg leading-none">
                {displayValue}
              </span>
              <span className="text-gray-500 dark:text-slate-400 text-[10px] font-medium">
                {unit}
              </span>
            </>
          ) : (
            <span className="text-gray-400 dark:text-slate-500 text-sm italic">
              Aucune donnée
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-slate-700/40 rounded-full h-1 overflow-hidden">
          <div
            className="h-1 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
              boxShadow: hasValue ? `0 0 6px ${color}60` : 'none'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
