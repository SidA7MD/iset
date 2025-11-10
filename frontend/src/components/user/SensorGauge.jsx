// =====================================================
// frontend/src/components/user/SensorGauge.jsx
import React from 'react';
import { formatValue, getSensorColor } from '../../utils/helpers';
import { getAlertLevel } from '../../utils/thresholds';

export default function SensorGauge({ icon, label, value, unit, type, max }) {
  const alertLevel = getAlertLevel(type, value);
  const color = getSensorColor(type, value);
  const percentage = Math.min((value / max) * 100, 100);
  const normalizedValue = Math.min(value, max);

  const getContainerStyles = () => {
    const baseStyles = "relative overflow-hidden rounded-lg border transition-all duration-200 hover:border-opacity-100";

    switch (alertLevel) {
      case 'critical':
        return `${baseStyles} bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/10 border-red-300 dark:border-red-500/40`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-300 dark:border-amber-500/40`;
      default:
        return `${baseStyles} bg-white dark:bg-slate-800/40 border-gray-200 dark:border-slate-600/30`;
    }
  };

  const getTextClass = () => {
    switch (alertLevel) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-gray-900 dark:text-slate-200';
    }
  };

  return (
    <div className={getContainerStyles()}>
      <div className="p-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {React.cloneElement(icon, {
              className: `h-3.5 w-3.5 ${getTextClass()}`
            })}
            <span className="font-medium text-gray-700 dark:text-slate-300 text-xs">
              {label}
            </span>
          </div>

          {/* Compact Status */}
          {alertLevel !== 'normal' && (
            <div className={`w-1.5 h-1.5 rounded-full ${alertLevel === 'critical' ? 'bg-red-500' : 'bg-amber-500'
              } animate-pulse`}></div>
          )}
        </div>

        {/* Value and Progress in One Line */}
        <div className="flex items-end justify-between gap-2 mb-2">
          <div className="flex items-baseline gap-1">
            <span className={`font-bold ${getTextClass()} text-xl leading-none`}>
              {value !== null && value !== undefined ? formatValue(normalizedValue) : '--'}
            </span>
            <span className="text-gray-500 dark:text-slate-400 text-[10px] font-medium">
              {unit}
            </span>
          </div>
          <span className={`text-xs font-semibold ${getTextClass()}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>

        {/* Slim Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-slate-700/40 rounded-full h-1 overflow-hidden">
          <div
            className="h-1 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}60`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
