import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const verifyUsers = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('+password');
    console.log(`Found ${users.length} users:\n`);

    for (const user of users) {
      console.log(`📧 Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
      console.log('');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

verifyUsers();
