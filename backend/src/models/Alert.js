// =====================================================

// backend/src/models/Alert.js
const mongoose = require('mongoose');
const { ALERT_SEVERITY, ALERT_TYPES } = require('../config/constants');

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    MAC: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    alertType: {
      type: String,
      enum: Object.values(ALERT_TYPES),
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(ALERT_SEVERITY),
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    acknowledged: {
      type: Boolean,
      default: false,
      index: true,
    },
    acknowledgedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
alertSchema.index({ userId: 1, acknowledged: 1 });
alertSchema.index({ MAC: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
