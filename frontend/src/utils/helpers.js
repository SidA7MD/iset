// frontend/src/utils/helpers.js
import { THRESHOLDS } from './thresholds';

/**
 * Format timestamp to readable date string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/D';
  const date = new Date(timestamp);
  return date.toLocaleString('fr-FR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date (alias for formatTimestamp)
 */
export const formatDate = formatTimestamp;

/**
 * Format timestamp to short time
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return 'N/D';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get alert level based on sensor type and value
 */
export const getAlertLevel = (sensorType, value) => {
  if (!value || !sensorType) return 'normal';

  const threshold = THRESHOLDS[sensorType];
  if (!threshold) return 'normal';

  if (value >= threshold.critical.max || value <= threshold.critical.min) {
    return 'critical';
  }
  if (value >= threshold.warning.max || value <= threshold.warning.min) {
    return 'warning';
  }
  return 'normal';
};

/**
 * Get color based on alert level
 */
export const getAlertColor = (level) => {
  const colors = {
    critical: '#ef4444', // red-500
    warning: '#f59e0b', // amber-500
    normal: '#10b981', // green-500
  };
  return colors[level] || colors.normal;
};

/**
 * Get sensor color based on value and type
 */
export const getSensorColor = (sensorType, value) => {
  const level = getAlertLevel(sensorType, value);
  return getAlertColor(level);
};

/**
 * Get color classes for Tailwind based on alert level
 */
export const getAlertColorClasses = (level) => {
  const classes = {
    critical: 'bg-red-100 text-red-800 border-red-500',
    warning: 'bg-amber-100 text-amber-800 border-amber-500',
    normal: 'bg-green-100 text-green-800 border-green-500',
  };
  return classes[level] || classes.normal;
};

/**
 * Get badge color classes for alerts
 */
export const getBadgeColorClasses = (level) => {
  const classes = {
    critical: 'badge-error',
    warning: 'badge-warning',
    normal: 'badge-success',
  };
  return classes[level] || classes.normal;
};

/**
 * Format sensor value with unit
 */
export const formatSensorValue = (sensorType, value) => {
  if (value === null || value === undefined) return 'N/D';

  const units = {
    temp: '°C',
    hmdt: '%',
    gaz: 'ppm',
  };

  const unit = units[sensorType] || '';
  return `${Number(value).toFixed(1)}${unit}`;
};

/**
 * Format value (alias for formatSensorValue)
 */
export const formatValue = formatSensorValue;

/**
 * Get sensor label
 */
export const getSensorLabel = (sensorType) => {
  const labels = {
    temp: 'Température',
    hmdt: 'Humidité',
    gaz: 'Niveau de Gaz',
  };
  return labels[sensorType] || sensorType;
};

/**
 * Check if device is online (last seen within 5 minutes)
 */
export const isDeviceOnline = (lastSeen) => {
  if (!lastSeen) return false;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return new Date(lastSeen).getTime() > fiveMinutesAgo;
};

/**
 * Get device status
 */
export const getDeviceStatus = (device) => {
  if (!device) return 'unknown';
  if (device.status === 'inactive') return 'inactive';
  return isDeviceOnline(device.lastSeen) ? 'online' : 'offline';
};

/**
 * Get status badge classes
 */
export const getStatusBadgeClasses = (status) => {
  const classes = {
    online: 'badge-success',
    offline: 'badge-error',
    inactive: 'badge-neutral',
    unknown: 'badge-ghost',
  };
  return classes[status] || classes.unknown;
};

/**
 * Calculate time ago
 */
export const timeAgo = (timestamp) => {
  if (!timestamp) return 'Jamais';

  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

  if (seconds < 60) return `il y a ${seconds}s`;
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
  return `il y a ${Math.floor(seconds / 86400)}j`;
};

/**
 * Format relative time (alias for timeAgo)
 */
export const formatRelativeTime = timeAgo;

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate chart data from sensor readings
 */
export const generateChartData = (sensorData, sensorType, limit = 20) => {
  if (!sensorData || !Array.isArray(sensorData)) return [];

  return sensorData.slice(-limit).map((reading) => ({
    timestamp: formatTime(reading.timestamp),
    value: reading[sensorType] || 0,
    fullTimestamp: reading.timestamp,
  }));
};

/**
 * Calculate average value
 */
export const calculateAverage = (values) => {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

/**
 * Get min/max values
 */
export const getMinMax = (values) => {
  if (!values || values.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
};

/**
 * Validate MAC address format
 */
export const isValidMacAddress = (mac) => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

/**
 * Format MAC address
 */
export const formatMacAddress = (mac) => {
  if (!mac) return 'N/D';
  return mac.toUpperCase();
};

/**
 * Sort devices by status and name
 */
export const sortDevices = (devices) => {
  return [...devices].sort((a, b) => {
    const statusA = getDeviceStatus(a);
    const statusB = getDeviceStatus(b);

    // Online devices first
    if (statusA === 'online' && statusB !== 'online') return -1;
    if (statusB === 'online' && statusA !== 'online') return 1;

    // Then sort by name
    return (a.name || '').localeCompare(b.name || '');
  });
};

/**
 * Filter devices by search query
 */
export const filterDevices = (devices, searchQuery) => {
  if (!searchQuery) return devices;

  const query = searchQuery.toLowerCase();
  return devices.filter(
    (device) =>
      device.name?.toLowerCase().includes(query) ||
      device.MAC?.toLowerCase().includes(query) ||
      device.location?.toLowerCase().includes(query)
  );
};

/**
 * Group alerts by device
 */
export const groupAlertsByDevice = (alerts) => {
  if (!alerts || !Array.isArray(alerts)) return {};

  return alerts.reduce((acc, alert) => {
    const deviceId = alert.deviceId?._id || alert.deviceId;
    if (!acc[deviceId]) {
      acc[deviceId] = [];
    }
    acc[deviceId].push(alert);
    return acc;
  }, {});
};

/**
 * Get recent alerts (last 24 hours)
 */
export const getRecentAlerts = (alerts) => {
  if (!alerts || !Array.isArray(alerts)) return [];

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return alerts.filter((alert) => new Date(alert.timestamp).getTime() > oneDayAgo);
};

/**
 * Format error message
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return 'Une erreur inattendue s\'est produite';
};

/**
 * Download data as JSON
 */
export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download data as CSV
 */
export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || '')).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
