// frontend/src/services/localStorageService.js
const STORAGE_PREFIX = 'iot_';
const MAX_READINGS_PER_DEVICE = 1000;

class LocalStorageService {
  getDeviceKey(MAC) {
    return `${STORAGE_PREFIX}device_${MAC}`;
  }

  getDeviceData(MAC) {
    try {
      const key = this.getDeviceKey(MAC);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  saveDeviceData(MAC, data) {
    try {
      const key = this.getDeviceKey(MAC);
      const existingData = this.getDeviceData(MAC) || { MAC, readings: [] };

      // Add new reading to beginning
      existingData.readings.unshift(data);

      // Limit array size
      if (existingData.readings.length > MAX_READINGS_PER_DEVICE) {
        existingData.readings = existingData.readings.slice(0, MAX_READINGS_PER_DEVICE);
      }

      existingData.lastSync = new Date().toISOString();

      localStorage.setItem(key, JSON.stringify(existingData));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  }

  getReadings(MAC, limit = null) {
    const data = this.getDeviceData(MAC);
    if (!data || !data.readings) return [];

    return limit ? data.readings.slice(0, limit) : data.readings;
  }

  getLatestReading(MAC) {
    const readings = this.getReadings(MAC, 1);
    return readings.length > 0 ? readings[0] : null;
  }

  clearDeviceData(MAC) {
    try {
      const key = this.getDeviceKey(MAC);
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error clearing device data:', error);
      return false;
    }
  }

  clearAllDeviceData() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(`${STORAGE_PREFIX}device_`)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing all device data:', error);
      return false;
    }
  }

  pruneOldData(MAC, daysToKeep = 7) {
    try {
      const data = this.getDeviceData(MAC);
      if (!data || !data.readings) return;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      data.readings = data.readings.filter((reading) => {
        return new Date(reading.timestamp) >= cutoffDate;
      });

      const key = this.getDeviceKey(MAC);
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error pruning old data:', error);
      return false;
    }
  }

  getStorageInfo() {
    try {
      const keys = Object.keys(localStorage);
      const deviceKeys = keys.filter((key) => key.startsWith(`${STORAGE_PREFIX}device_`));

      let totalReadings = 0;
      let totalSize = 0;

      deviceKeys.forEach((key) => {
        const value = localStorage.getItem(key);
        totalSize += new Blob([value]).size;
        const data = JSON.parse(value);
        totalReadings += data.readings?.length || 0;
      });

      return {
        deviceCount: deviceKeys.length,
        totalReadings,
        totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }
}

export default new LocalStorageService();
