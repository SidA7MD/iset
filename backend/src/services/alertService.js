// =====================================================

// backend/src/services/alertService.js
const Alert = require('../models/Alert');
const User = require('../models/User');
const Device = require('../models/Device');
const config = require('../config/env');
const { ALERT_SEVERITY, ALERT_TYPES } = require('../config/constants');

class AlertService {
  checkThresholds(sensorData) {
    const alerts = [];
    const { temperature, humidity, gas } = sensorData;
    const thresholds = config.thresholds;

    // Check temperature
    if (temperature >= thresholds.temperature.critical) {
      alerts.push({
        type: ALERT_TYPES.TEMPERATURE,
        severity: ALERT_SEVERITY.CRITICAL,
        value: temperature,
        threshold: thresholds.temperature.critical,
        message: `Critical temperature: ${temperature}°C exceeds ${thresholds.temperature.critical}°C`,
      });
    } else if (temperature >= thresholds.temperature.warning) {
      alerts.push({
        type: ALERT_TYPES.TEMPERATURE,
        severity: ALERT_SEVERITY.WARNING,
        value: temperature,
        threshold: thresholds.temperature.warning,
        message: `High temperature: ${temperature}°C exceeds ${thresholds.temperature.warning}°C`,
      });
    }

    // Check humidity
    if (humidity >= thresholds.humidity.high) {
      alerts.push({
        type: ALERT_TYPES.HUMIDITY,
        severity: ALERT_SEVERITY.WARNING,
        value: humidity,
        threshold: thresholds.humidity.high,
        message: `High humidity: ${humidity}% exceeds ${thresholds.humidity.high}%`,
      });
    } else if (humidity <= thresholds.humidity.low) {
      alerts.push({
        type: ALERT_TYPES.HUMIDITY,
        severity: ALERT_SEVERITY.WARNING,
        value: humidity,
        threshold: thresholds.humidity.low,
        message: `Low humidity: ${humidity}% below ${thresholds.humidity.low}%`,
      });
    }

    // Check gas
    if (gas >= thresholds.gas.critical) {
      alerts.push({
        type: ALERT_TYPES.GAS,
        severity: ALERT_SEVERITY.CRITICAL,
        value: gas,
        threshold: thresholds.gas.critical,
        message: `Critical gas level: ${gas} ppm exceeds ${thresholds.gas.critical} ppm`,
      });
    } else if (gas >= thresholds.gas.warning) {
      alerts.push({
        type: ALERT_TYPES.GAS,
        severity: ALERT_SEVERITY.WARNING,
        value: gas,
        threshold: thresholds.gas.warning,
        message: `High gas level: ${gas} ppm exceeds ${thresholds.gas.warning} ppm`,
      });
    }

    return alerts;
  }

  async createAlerts(MAC, alertsData) {
    const device = await Device.findOne({ MAC }).populate('assignedTo');

    if (!device || !device.assignedTo) {
      return [];
    }

    const createdAlerts = [];

    for (const alertData of alertsData) {
      const alert = new Alert({
        userId: device.assignedTo._id,
        MAC,
        alertType: alertData.type,
        value: alertData.value,
        threshold: alertData.threshold,
        severity: alertData.severity,
        message: alertData.message,
      });

      await alert.save();
      createdAlerts.push(alert);
    }

    return createdAlerts;
  }

  async getUserAlerts(userId, acknowledged = null) {
    const query = { userId };

    if (acknowledged !== null) {
      query.acknowledged = acknowledged;
    }

    return await Alert.find(query).sort({ createdAt: -1 }).limit(100);
  }

  async acknowledgeAlert(alertId, userId) {
    const alert = await Alert.findOne({ _id: alertId, userId });

    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.acknowledged = true;
    alert.acknowledgedAt = new Date();
    await alert.save();

    return alert;
  }
}

module.exports = new AlertService();
