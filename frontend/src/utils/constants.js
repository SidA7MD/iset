// frontend/src/utils/constants.js

/**
 * API Base URL
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * WebSocket URL
 */
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

/**
 * User roles
 */
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

/**
 * Device status
 */
export const DEVICE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ONLINE: 'online',
  OFFLINE: 'offline',
};

/**
 * Alert levels
 */
export const ALERT_LEVELS = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  NORMAL: 'normal',
};

/**
 * Sensor types
 */
export const SENSOR_TYPES = {
  TEMPERATURE: 'temp',
  HUMIDITY: 'hmdt',
  GAS: 'gaz',
};

/**
 * Sensor labels
 */
export const SENSOR_LABELS = {
  temp: 'Temperature',
  hmdt: 'Humidity',
  gaz: 'Gas Level',
};

/**
 * Time ranges for historical data
 */
export const TIME_RANGES = {
  LAST_HOUR: '1h',
  LAST_6_HOURS: '6h',
  LAST_24_HOURS: '24h',
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
};

/**
 * Time range labels
 */
export const TIME_RANGE_LABELS = {
  '1h': 'Last Hour',
  '6h': 'Last 6 Hours',
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
};

/**
 * Chart colors
 */
export const CHART_COLORS = {
  temp: '#ef4444', // red
  hmdt: '#3b82f6', // blue
  gaz: '#f59e0b', // amber
};

/**
 * Data refresh intervals (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  REAL_TIME: 1000, // 1 second
  FAST: 5000, // 5 seconds
  NORMAL: 30000, // 30 seconds
  SLOW: 60000, // 1 minute
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER: 'user',
  THEME: 'theme',
  LAYOUT_PREFERENCES: 'layoutPreferences',
};

/**
 * Date formats
 */
export const DATE_FORMATS = {
  FULL: 'MMM DD, YYYY HH:mm:ss',
  SHORT: 'MMM DD, YYYY',
  TIME_ONLY: 'HH:mm:ss',
  TIME_SHORT: 'HH:mm',
};

/**
 * WebSocket events
 */
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  AUTHENTICATE: 'authenticate',
  SENSOR_DATA: 'sensor-data',
  ALERT: 'alert',
  DEVICE_STATUS: 'device-status',
  JOIN_DEVICE: 'join-device',
  LEAVE_DEVICE: 'leave-device',
};

/**
 * Toast notification durations (in milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
};

/**
 * File upload limits
 */
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
};

/**
 * Validation rules
 */
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  MAC_ADDRESS: {
    PATTERN: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
  },
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT: 'Request timeout. Please try again.',
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  USER_CREATED: 'User created successfully!',
  USER_UPDATED: 'User updated successfully!',
  USER_DELETED: 'User deleted successfully!',
  DEVICE_CREATED: 'Device created successfully!',
  DEVICE_UPDATED: 'Device updated successfully!',
  DEVICE_DELETED: 'Device deleted successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
};

/**
 * Device online threshold (milliseconds)
 * If no data received within this time, device is considered offline
 */
export const DEVICE_ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

/**
 * Alert retention period (days)
 */
export const ALERT_RETENTION_DAYS = 30;

/**
 * Maximum number of data points to show on charts
 */
export const MAX_CHART_POINTS = 50;

/**
 * Debounce delays (milliseconds)
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 200,
};

/**
 * API request timeout (milliseconds)
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Rate limiting
 */
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes
};

export default {
  API_URL,
  WS_URL,
  ROLES,
  DEVICE_STATUS,
  ALERT_LEVELS,
  SENSOR_TYPES,
  SENSOR_LABELS,
  TIME_RANGES,
  TIME_RANGE_LABELS,
  CHART_COLORS,
  REFRESH_INTERVALS,
  PAGINATION,
  STORAGE_KEYS,
  DATE_FORMATS,
  WS_EVENTS,
  TOAST_DURATION,
  UPLOAD_LIMITS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEVICE_ONLINE_THRESHOLD,
  ALERT_RETENTION_DAYS,
  MAX_CHART_POINTS,
  DEBOUNCE_DELAYS,
  API_TIMEOUT,
  RATE_LIMITS,
};
