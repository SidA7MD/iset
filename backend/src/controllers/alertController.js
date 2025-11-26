// =====================================================

// backend/src/controllers/alertController.js
const alertService = require('../services/alertService');

class AlertController {
  async getAlerts(req, res, next) {
    try {
      const { acknowledged } = req.query;
      const ack = acknowledged === 'true' ? true : acknowledged === 'false' ? false : null;

      const alerts = await alertService.getUserAlerts(req.user.userId, ack);

      res.json({
        success: true,
        data: { alerts },
      });
    } catch (error) {
      next(error);
    }
  }

  async acknowledgeAlert(req, res, next) {
    try {
      const { alertId } = req.params;
      const alert = await alertService.acknowledgeAlert(alertId, req.user.userId);

      res.json({
        success: true,
        message: 'Alert acknowledged',
        data: { alert },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeviceAlerts(req, res, next) {
    try {
      const { MAC } = req.params;
      const Alert = require('../models/Alert');

      const alerts = await Alert.find({
        MAC,
        userId: req.user.userId,
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: { alerts },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlertController();
