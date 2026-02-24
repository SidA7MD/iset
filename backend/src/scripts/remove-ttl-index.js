// backend/src/scripts/remove-ttl-index.js
// Run this script once to remove the old TTL index that auto-deletes data after 30 days.
// Usage: node src/scripts/remove-ttl-index.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/iot-monitoring';

async function removeTTLIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.db.collection('sensordatas');
    
    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Find and drop any TTL index on the timestamp field
    for (const index of indexes) {
      if (index.expireAfterSeconds !== undefined) {
        console.log(`\nFound TTL index: ${index.name} (expires after ${index.expireAfterSeconds}s)`);
        console.log('Dropping TTL index...');
        await collection.dropIndex(index.name);
        console.log('TTL index dropped successfully! Data will now be kept permanently.');
      }
    }

    // Create a regular index on timestamp if it doesn't exist
    await collection.createIndex({ timestamp: 1 });
    console.log('\nCreated regular (non-TTL) index on timestamp field.');
    console.log('\nDone! Your sensor data will now be archived permanently.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

removeTTLIndex();
