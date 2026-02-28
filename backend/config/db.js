import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB database
 * Attempts to connect to production MongoDB Atlas first,
 * then falls back to local MongoDB if Atlas connection fails
 * 
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB Atlas (production)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are now default in Mongoose 6+
      // But included for clarity and backwards compatibility
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB Atlas: ${error.message}`);
    console.error('🔄 Attempting to connect to local MongoDB...');
    
    try {
      // Fallback to local MongoDB for development
      const localConn = await mongoose.connect('mongodb://localhost:27017/healthcare', {});
      console.log(`✅ MongoDB Connected (Local): ${localConn.connection.host}`);
      console.log(`📁 Database Name: ${localConn.connection.name}`);
    } catch (localError) {
      console.error(`❌ Error connecting to local MongoDB: ${localError.message}`);
      console.error('⚠️  Server will continue without database connection - some features may not work');
      // Don't exit - allow server to run for debugging purposes
    }
  }
};

export default connectDB;
