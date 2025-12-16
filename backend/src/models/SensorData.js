// backend/src/models/SensorData.js
const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema(
  {
    MAC: {
      type: String,
      required: [true, 'MAC address is required'],
      trim: true,
      uppercase: true,
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature is required'],
    },
    humidity: {
      type: Number,
      required: [true, 'Humidity is required'],
    },
    gas: {
      type: Number,
      required: [true, 'Gas level is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      // ✅ FIX: Removed "index: true" - it's already indexed below in compound and TTL indexes
    },
    alertTriggered: {
      type: Boolean,
      default: false,
    },
    alertTypes: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: false,
  }
);

// Compound indexes for efficient queries
sensorDataSchema.index({ MAC: 1, timestamp: -1 });
sensorDataSchema.index({ alertTriggered: 1 });

// ✅ FIX: TTL index - this already creates an index on timestamp
// The warning was because we had both "index: true" on the field AND this TTL index
sensorDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('SensorData', sensorDataSchema);
