// backend/src/config/database.js
const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    };

    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    await mongoose.connect(config.mongodb.uri, options);
    console.log('✅ MongoDB connected successfully');

    // Clean up old indexes after connection
    cleanupOldIndexes().catch(err => console.warn('Index cleanup warning:', err.message));

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Reconnect attempted...');
    });
  } catch (error) {
    console.error('❌ MongoDB connection FAILED:', error.message);
    console.info('ℹ️ Server will continue to run for diagnostics.');
    // DO NOT EXIT - Keep server alive for health checks and debug endpoints
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
