// =====================================================

// backend/src/services/sensorDataService.js
const SensorData = require('../models/SensorData');
const Device = require('../models/Device');
const alertService = require('./alertService');
const { NotFoundError } = require('../utils/errorTypes');
const { DEVICE_STATUS } = require('../config/constants');

class SensorDataService {
  async ingestData(MAC, temperature, humidity, gas) {
    // Find or create device
    let device = await Device.findOne({ MAC });
    const now = new Date();

    if (!device) {
      device = new Device({
        MAC,
        status: DEVICE_STATUS.ACTIVE,
        lastSeen: now,
      });
      await device.save();
    } else {
      device.lastSeen = now;
      await device.save();
    }

    // Check for alerts
    const alerts = alertService.checkThresholds({ temperature, humidity, gas });

    // Create sensor data entry
    const sensorData = new SensorData({
      MAC,
      temperature,
      humidity,
      gas,
      timestamp: new Date(),
      alertTriggered: alerts.length > 0,
      alertTypes: alerts.map((a) => a.type),
    });

    await sensorData.save();

    // Create alert records if thresholds exceeded
    let createdAlerts = [];
    if (alerts.length > 0) {
      createdAlerts = await alertService.createAlerts(MAC, alerts);
    }

    return {
      sensorData,
      alerts: createdAlerts,
      device,
    };
  }

  async getLatestReading(MAC, userId, userRole) {
    // Check user has access to device
    if (userRole !== 'admin') {
      const device = await Device.findOne({ MAC, assignedTo: userId });
      if (!device) {
        throw new NotFoundError('Device not found or not assigned to user');
      }
    }

    const latestData = await SensorData.findOne({ MAC }).sort({ timestamp: -1 });

    if (!latestData) {
      throw new NotFoundError('No data found for device');
    }

    return latestData;
  }

  async getHistory(MAC, userId, userRole, startDate, endDate, limit = 100) {
    // Check user has access to device
    if (userRole !== 'admin') {
      const device = await Device.findOne({ MAC, assignedTo: userId });
      if (!device) {
        throw new NotFoundError('Device not found or not assigned to user');
      }
    }

    const query = { MAC };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    return await SensorData.find(query).sort({ timestamp: -1 }).limit(Math.min(limit, 1000));
  }

  async getStatistics(MAC, userId, userRole, startDate, endDate) {
    // Check user has access to device
    if (userRole !== 'admin') {
      const device = await Device.findOne({ MAC, assignedTo: userId });
      if (!device) {
        throw new NotFoundError('Device not found or not assigned to user');
      }
    }

    const matchQuery = { MAC };

    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
      if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
    }

    const stats = await SensorData.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$MAC',
          avgTemperature: { $avg: '$temperature' },
          minTemperature: { $min: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          minHumidity: { $min: '$humidity' },
          maxHumidity: { $max: '$humidity' },
          avgGas: { $avg: '$gas' },
          minGas: { $min: '$gas' },
          maxGas: { $max: '$gas' },
          count: { $sum: 1 },
        },
      },
    ]);

    return stats[0] || null;
  }

  /**
   * Get daily aggregated data for long-term archive views.
   * Returns one data point per day with avg/min/max for each sensor.
   */
  async getDailyAggregation(MAC, userId, userRole, startDate, endDate) {
    // Check user has access to device
    if (userRole !== 'admin') {
      const device = await Device.findOne({ MAC, assignedTo: userId });
      if (!device) {
        throw new NotFoundError('Device not found or not assigned to user');
      }
    }

    const matchQuery = { MAC };
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
      if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
    }

    const dailyData = await SensorData.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
          },
          date: { $first: '$timestamp' },
          avgTemperature: { $avg: '$temperature' },
          minTemperature: { $min: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          minHumidity: { $min: '$humidity' },
          maxHumidity: { $max: '$humidity' },
          avgGas: { $avg: '$gas' },
          minGas: { $min: '$gas' },
          maxGas: { $max: '$gas' },
          count: { $sum: 1 },
          alerts: { $sum: { $cond: ['$alertTriggered', 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return dailyData;
  }

  /**
   * Get monthly aggregated data for yearly overview.
   */
  async getMonthlyAggregation(MAC, userId, userRole, year) {
    if (userRole !== 'admin') {
      const device = await Device.findOne({ MAC, assignedTo: userId });
      if (!device) {
        throw new NotFoundError('Device not found or not assigned to user');
      }
    }

    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const monthlyData = await SensorData.aggregate([
      {
        $match: {
          MAC,
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$timestamp' } },
          avgTemperature: { $avg: '$temperature' },
          minTemperature: { $min: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          minHumidity: { $min: '$humidity' },
          maxHumidity: { $max: '$humidity' },
          avgGas: { $avg: '$gas' },
          minGas: { $min: '$gas' },
          maxGas: { $max: '$gas' },
          count: { $sum: 1 },
          alerts: { $sum: { $cond: ['$alertTriggered', 1, 0] } },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    return monthlyData;
  }
}

module.exports = new SensorDataService();
