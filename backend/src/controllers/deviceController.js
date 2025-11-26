// =====================================================

// backend/src/controllers/deviceController.js
const deviceService = require('../services/deviceService');

class DeviceController {
  async getAllDevices(req, res, next) {
    try {
      const devices = await deviceService.getAllDevices();

      res.json({
        success: true,
        data: { devices },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyDevices(req, res, next) {
    try {
      const devices = await deviceService.getUserDevices(req.user.userId);

      res.json({
        success: true,
        data: { devices },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeviceByMAC(req, res, next) {
    try {
      const { MAC } = req.params;
      const device = await deviceService.getDeviceByMAC(MAC);

      // Check if user has access (if not admin)
      if (req.user.role !== 'admin' && device.assignedTo?._id.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      res.json({
        success: true,
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDevice(req, res, next) {
    try {
      const { MAC } = req.params;
      const updates = req.body;

      const device = await deviceService.updateDevice(MAC, updates);

      res.json({
        success: true,
        message: 'Device updated successfully',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeviceStatus(req, res, next) {
    try {
      const { MAC } = req.params;
      const device = await deviceService.getDeviceByMAC(MAC);

      const now = new Date();
      const lastSeen = new Date(device.lastSeen);
      const minutesSinceLastSeen = (now - lastSeen) / 1000 / 60;

      const isOnline = minutesSinceLastSeen < 5;

      res.json({
        success: true,
        data: {
          MAC: device.MAC,
          status: device.status,
          isOnline,
          lastSeen: device.lastSeen,
          minutesSinceLastSeen: Math.round(minutesSinceLastSeen),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DeviceController();
