// backend/src/scripts/seedAdmin.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('❌ Admin already exists:');
      console.log('   Username:', adminExists.username);
      console.log('   Email:', adminExists.email);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create a new admin
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin@123', // hashed by pre-save middleware
      role: 'admin',
      isActive: true,
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📌 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: Admin@123');
    console.log('   Email: admin@example.com');
    console.log('');
    console.log('🌐 Login at: http://localhost:5173/login');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedAdmin();
