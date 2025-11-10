// backend/src/config/database.js
const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(config.mongodb.uri, options);

    logger.info('MongoDB connected successfully');

    // Clean up old indexes after connection
    await cleanupOldIndexes();

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Function to clean up old/problematic indexes
const cleanupOldIndexes = async () => {
  try {
    const Device = require('../models/Device');

    // Get all existing indexes
    const indexes = await Device.collection.getIndexes();

    // Check if old deviceId index exists
    if (indexes.deviceId_1) {
      logger.info('Found old deviceId_1 index, dropping it...');
      await Device.collection.dropIndex('deviceId_1');
      logger.info('Successfully dropped deviceId_1 index');
    }

    // Ensure correct indexes exist
    await Device.syncIndexes();
    logger.info('Device indexes synchronized');
  } catch (error) {
    if (error.code === 27) {
      // Index doesn't exist - this is fine
      logger.info('No old deviceId index found (this is normal)');
    } else if (error.message.includes('ns not found')) {
      // Collection doesn't exist yet - this is fine
      logger.info('Device collection will be created on first use');
    } else {
      logger.warn(`Index cleanup warning: ${error.message}`);
    }
  }
};

module.exports = connectDB;
