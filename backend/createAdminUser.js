import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Delete any existing problematic admin users
    const deletedUsers = await User.deleteMany({
      email: { $in: ['adminn@healthcare.com', 'admin@health.com'] }
    });
    console.log(`Deleted ${deletedUsers.deletedCount} existing admin user(s)`);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@health.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log({
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
      process.exit(0);
    }

    // Create new admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@health.com',
      password: 'Admin@123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log({
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();
