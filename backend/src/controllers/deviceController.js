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

  async createDevice(req, res, next) {
    try {
      const { MAC, deviceName, location } = req.body;

      if (!MAC) {
        return res.status(400).json({
          success: false,
          error: 'MAC address is required',
        });
      }

      const device = await deviceService.createDevice({ MAC, deviceName, location });

      res.status(201).json({
        success: true,
        message: 'Device created successfully',
        data: { device },
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'Device with this MAC address already exists',
        });
      }
      next(error);
    }
  }

  async deleteDevice(req, res, next) {
    try {
      const { MAC } = req.params;

      await deviceService.deleteDevice(MAC);

      res.json({
        success: true,
        message: 'Device deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async assignDevice(req, res, next) {
    try {
      const { MAC } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      const device = await deviceService.assignDeviceToUser(MAC, userId);

      res.json({
        success: true,
        message: 'Device assigned successfully',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  }

  async unassignDevice(req, res, next) {
    try {
      const { MAC } = req.params;

      const device = await deviceService.unassignDevice(MAC);

      res.json({
        success: true,
        message: 'Device unassigned successfully',
        data: { device },
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
