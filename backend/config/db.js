const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n⚠️  MongoDB connection warning: ${error.message}`);
    console.warn(`   Database features require MongoDB. Ensure MongoDB is running on ${config.mongodbUri}`);
    console.warn(`   Configure MONGODB_URI in your .env file if using MongoDB Atlas or a custom host.\n`);
  }
};

module.exports = connectDB;
