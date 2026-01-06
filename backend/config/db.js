const mongoose = require('mongoose');

const connectDB = async () => {

  const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MongoDB connection string is missing! Set MONGODB_URL or MONGODB_URI in your environment variables.');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');
    
    // Optional: Log connection status
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;