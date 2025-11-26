// backend/src/models/Device.js
const mongoose = require('mongoose');
const { DEVICE_STATUS } = require('../config/constants');

const deviceSchema = new mongoose.Schema(
  {
    MAC: {
      type: String,
      required: [true, 'MAC address is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deviceName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: Object.values(DEVICE_STATUS),
      default: DEVICE_STATUS.ACTIVE,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      firmware: String,
      model: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// FIX: Removed duplicate MAC index since unique: true already creates an index
// deviceSchema.index({ MAC: 1 }); // REMOVED - conflicts with unique index
deviceSchema.index({ assignedTo: 1 });
deviceSchema.index({ status: 1 });
deviceSchema.index({ lastSeen: 1 }); // Added for efficient queries on device activity

module.exports = mongoose.model('Device', deviceSchema);
