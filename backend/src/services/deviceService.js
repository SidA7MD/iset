// backend/src/services/deviceService.js
// VERSION: Auto-reassign devices to new user (no conflicts)
const Device = require('../models/Device');
const User = require('../models/User');
const { NotFoundError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

class DeviceService {
  async getAllDevices() {
    return await Device.find().populate('assignedTo', 'username email');
  }

  async getDeviceByMAC(MAC) {
    const device = await Device.findOne({ MAC }).populate('assignedTo', 'username email');
    if (!device) {
      throw new NotFoundError('Device not found');
    }
    return device;
  }

  async getUserDevices(userId) {
    return await Device.find({ assignedTo: userId });
  }

  async updateDevice(MAC, updates) {
    const device = await Device.findOne({ MAC });
    if (!device) {
      throw new NotFoundError('Device not found');
    }

    Object.assign(device, updates);
    await device.save();
    return device;
  }

  async assignDevicesToUser(userId, deviceMACs) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get previously assigned devices to unassign them
    const previousDevices = user.assignedDevices || [];

    // Unassign devices that are no longer in the new list
    const devicesToRemove = previousDevices.filter((mac) => !deviceMACs.includes(mac));
    for (const MAC of devicesToRemove) {
      const device = await Device.findOne({ MAC });
      if (device && device.assignedTo?.toString() === userId) {
        device.assignedTo = null;
        await device.save();
      }
    }

    // Assign new devices (create if they don't exist)
    for (const MAC of deviceMACs) {
      let device = await Device.findOne({ MAC });

      if (!device) {
        // Create new device if it doesn't exist
        device = new Device({ MAC });
        logger.info(`Created new device: ${MAC}`);
      } else if (device.assignedTo && device.assignedTo.toString() !== userId) {
        // Device is assigned to another user - remove it from that user
        const previousUser = await User.findById(device.assignedTo);
        if (previousUser) {
          previousUser.assignedDevices = previousUser.assignedDevices.filter((d) => d !== MAC);
          await previousUser.save();
          logger.info(`Reassigned device ${MAC} from user ${previousUser.username} to new user`);
        }
      }

      // Assign device to current user
      device.assignedTo = userId;
      await device.save();
    }

    // Replace user's assigned devices list with the new list
    user.assignedDevices = deviceMACs;
    await user.save();

    return user;
  }

  async removeDeviceFromUser(userId, MAC) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const device = await Device.findOne({ MAC });
    if (device && device.assignedTo?.toString() === userId) {
      device.assignedTo = null;
      await device.save();
    }

    user.assignedDevices = user.assignedDevices.filter((d) => d !== MAC);
    await user.save();

    return user;
  }
}

module.exports = new DeviceService();
