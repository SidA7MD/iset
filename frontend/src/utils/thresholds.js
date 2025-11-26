// frontend/src/utils/thresholds.js

/**
 * Sensor threshold configurations
 * Used for determining alert levels and visualizations
 */
export const THRESHOLDS = {
  temp: {
    unit: '°C',
    normal: { min: 15, max: 30 },
    warning: { min: 10, max: 35 },
    critical: { min: 5, max: 40 },
    ideal: 22,
  },
  hmdt: {
    unit: '%',
    normal: { min: 30, max: 70 },
    warning: { min: 20, max: 80 },
    critical: { min: 10, max: 90 },
    ideal: 50,
  },
  gaz: {
    unit: 'ppm',
    normal: { min: 0, max: 400 },
    warning: { min: 0, max: 800 },
    critical: { min: 0, max: 1000 },
    ideal: 200,
  },
};

/**
 * Get threshold for a specific sensor type
 */
export const getThreshold = (sensorType) => {
  return THRESHOLDS[sensorType] || null;
};

/**
 * Check if value is in normal range
 */
export const isNormal = (sensorType, value) => {
  const threshold = THRESHOLDS[sensorType];
  if (!threshold) return true;
  return value >= threshold.normal.min && value <= threshold.normal.max;
};

/**
 * Check if value triggers warning
 */
export const isWarning = (sensorType, value) => {
  const threshold = THRESHOLDS[sensorType];
  if (!threshold) return false;
  return (
    (value >= threshold.warning.max || value <= threshold.warning.min) &&
    value < threshold.critical.max &&
    value > threshold.critical.min
  );
};

/**
 * Check if value triggers critical alert
 */
export const isCritical = (sensorType, value) => {
  const threshold = THRESHOLDS[sensorType];
  if (!threshold) return false;
  return value >= threshold.critical.max || value <= threshold.critical.min;
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
 * Get gauge configuration for a sensor type
 */
export const getGaugeConfig = (sensorType) => {
  const threshold = THRESHOLDS[sensorType];
  if (!threshold) return null;

  return {
    min: threshold.critical.min,
    max: threshold.critical.max,
    zones: [
      {
        from: threshold.critical.min,
        to: threshold.warning.min,
        color: '#ef4444', // red
      },
      {
        from: threshold.warning.min,
        to: threshold.normal.min,
        color: '#f59e0b', // amber
      },
      {
        from: threshold.normal.min,
        to: threshold.normal.max,
        color: '#10b981', // green
      },
      {
        from: threshold.normal.max,
        to: threshold.warning.max,
        color: '#f59e0b', // amber
      },
      {
        from: threshold.warning.max,
        to: threshold.critical.max,
        color: '#ef4444', // red
      },
    ],
  };
};

/**
 * Get suggested actions for alert level
 */
export const getSuggestedActions = (sensorType, level) => {
  const actions = {
    temp: {
      critical: 'Immediate attention required! Check HVAC system.',
      warning: 'Monitor temperature. Consider adjusting climate control.',
      normal: 'Temperature is within normal range.',
    },
    hmdt: {
      critical: 'Critical humidity level! Risk of equipment damage.',
      warning: 'Humidity outside ideal range. Check ventilation.',
      normal: 'Humidity is within normal range.',
    },
    gaz: {
      critical: 'Dangerous gas levels detected! Evacuate and ventilate.',
      warning: 'Elevated gas levels detected. Ensure proper ventilation.',
      normal: 'Gas levels are within safe range.',
    },
  };

  return actions[sensorType]?.[level] || 'No action required.';
};

export default THRESHOLDS;
