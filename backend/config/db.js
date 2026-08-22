const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-city-portal';
    await mongoose.connect(uri);

    mongoose.connection.once('open', () => {
      console.log('Connected DB:', mongoose.connection.name);
    });

    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;