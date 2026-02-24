// =====================================================
// backend/src/controllers/sensorDataController.js
// UPDATE ingestData to handle both GET and POST

const sensorDataService = require('../services/sensorDataService');
const websocketService = require('../services/websocketService');

class SensorDataController {
  async ingestData(req, res, next) {
    try {
      // Support both GET (query) and POST (body)
      const data = req.method === 'GET' ? req.query : req.body;
      const { MAC, temp, hmdt, gaz } = data;

      const temperature = parseFloat(temp);
      const humidity = parseFloat(hmdt);
      const gas = parseFloat(gaz);

      const result = await sensorDataService.ingestData(MAC, temperature, humidity, gas);

      // Broadcast to WebSocket clients
      websocketService.broadcastSensorData(MAC, result.sensorData);

      // Broadcast device online status
      websocketService.broadcastDeviceStatus(MAC, {
        isOnline: true,
        lastSeen: result.device.lastSeen,
      });

      // Broadcast alerts if any
      if (result.alerts.length > 0) {
        result.alerts.forEach((alert) => {
          websocketService.broadcastAlert(MAC, alert);
        });
      }

      res.json({
        success: true,
        message: 'Data received successfully',
        data: {
          MAC,
          timestamp: result.sensorData.timestamp,
          alertTriggered: result.sensorData.alertTriggered,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getLatest(req, res, next) {
    try {
      const { MAC } = req.params;
      const data = await sensorDataService.getLatestReading(MAC, req.user.userId, req.user.role);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { MAC } = req.params;
      const { start, end, limit = 100 } = req.query;

      const data = await sensorDataService.getHistory(
        MAC,
        req.user.userId,
        req.user.role,
        start,
        end,
        parseInt(limit)
      );

      res.json({
        success: true,
        data: { readings: data },
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const { MAC } = req.params;
      const { start, end } = req.query;

      const stats = await sensorDataService.getStatistics(
        MAC,
        req.user.userId,
        req.user.role,
        start,
        end
      );

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDailyAggregation(req, res, next) {
    try {
      const { MAC } = req.params;
      const { start, end } = req.query;

      const data = await sensorDataService.getDailyAggregation(
        MAC,
        req.user.userId,
        req.user.role,
        start,
        end
      );

      res.json({
        success: true,
        data: { daily: data },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyAggregation(req, res, next) {
    try {
      const { MAC } = req.params;
      const { year } = req.query;

      const data = await sensorDataService.getMonthlyAggregation(
        MAC,
        req.user.userId,
        req.user.role,
        parseInt(year) || new Date().getFullYear()
      );

      res.json({
        success: true,
        data: { monthly: data },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SensorDataController();
