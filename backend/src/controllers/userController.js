// =====================================================

// backend/src/controllers/userController.js
const User = require('../models/User');
const deviceService = require('../services/deviceService');
const websocketService = require('../services/websocketService');
const { NotFoundError } = require('../utils/errorTypes');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 50 } = req.query;

      const users = await User.find()
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await User.countDocuments();

      res.json({
        success: true,
        data: {
          users,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          total: count,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await User.findById(req.params.userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { email, password, isActive } = req.body;
      const user = await User.findById(req.params.userId).select('+password');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (email) user.email = email;
      if (password) user.password = password;
      if (typeof isActive !== 'undefined') user.isActive = isActive;

      await user.save();

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const user = await User.findById(req.params.userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.isActive = false;
      await user.save();

      res.json({
        success: true,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async assignDevices(req, res, next) {
    try {
      const { userId } = req.params;
      const { devices } = req.body;

      const user = await deviceService.assignDevicesToUser(userId, devices);

      // Notify user via WebSocket
      websocketService.notifyDeviceAssignment(userId, devices);

      res.json({
        success: true,
        message: 'Devices assigned successfully',
        data: {
          user,
          assignedDevices: user.assignedDevices,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeDevice(req, res, next) {
    try {
      const { userId, MAC } = req.params;

      const user = await deviceService.removeDeviceFromUser(userId, MAC);

      res.json({
        success: true,
        message: 'Device removed successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserDevices(req, res, next) {
    try {
      const devices = await deviceService.getUserDevices(req.params.userId);

      res.json({
        success: true,
        data: { devices },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
