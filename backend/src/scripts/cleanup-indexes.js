// backend/cleanup-indexes.js
// Run this once with: node cleanup-indexes.js

require('dotenv').config();
const mongoose = require('mongoose');

const cleanupIndexes = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');

    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);

    const db = mongoose.connection.db;

    // List all collections
    console.log('\n📋 Collections in database:');
    const collections = await db.listCollections().toArray();
    collections.forEach((coll) => {
      console.log(`   - ${coll.name}`);
    });

    // Check if devices collection exists
    const devicesExists = collections.some((c) => c.name === 'devices');

    if (!devicesExists) {
      console.log('\n✅ No devices collection found - no cleanup needed!');
      console.log(
        'ℹ️  The collection will be created automatically when you assign the first device.'
      );
      console.log('\n👉 Your issue might be in the validation middleware. Let me check...');

      // Import and check the Device model
      require('./src/models/Device');
      const Device = mongoose.model('Device');

      console.log('\n📝 Device Model Schema:');
      console.log(
        '   Required fields:',
        Object.keys(Device.schema.paths).filter((path) => {
          return Device.schema.paths[path].isRequired;
        })
      );

      console.log(
        '\n✅ Cleanup completed - collection will be created with correct schema on first use'
      );
      return;
    }

    const devicesCollection = db.collection('devices');

    // Get all indexes
    console.log('\n📋 Current indexes on devices collection:');
    try {
      const indexes = await devicesCollection.indexes();
      indexes.forEach((index) => {
        console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
      });

      // Drop the problematic deviceId index if it exists
      const hasDeviceIdIndex = indexes.some((idx) => idx.name === 'deviceId_1');

      if (hasDeviceIdIndex) {
        console.log('\n🗑️  Found deviceId_1 index, dropping it...');
        await devicesCollection.dropIndex('deviceId_1');
        console.log('✅ Successfully dropped deviceId_1 index');
      } else {
        console.log('\nℹ️  No deviceId_1 index found (this is good)');
      }

      // Show final indexes
      console.log('\n📋 Final indexes on devices collection:');
      const finalIndexes = await devicesCollection.indexes();
      finalIndexes.forEach((index) => {
        console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    } catch (error) {
      console.error('❌ Error accessing indexes:', error.message);
    }

    // Count existing devices
    const deviceCount = await devicesCollection.countDocuments();
    console.log(`\n📊 Total devices in collection: ${deviceCount}`);

    console.log('\n✅ Cleanup completed successfully!');
    console.log('👉 You can now restart your backend server');
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

cleanupIndexes();
