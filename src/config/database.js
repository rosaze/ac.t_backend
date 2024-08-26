const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from the .env file
dotenv.config();

class DbConnection {
  constructor() {
    this.connect();
  }

  async connect() {
    try {
      const uri = process.env.MONGO_URI;

      // Check if the URI is defined
      if (!uri) {
        throw new Error(
          'MONGO_URI is not defined. Please add it to your .env file.'
        );
      }

      await mongoose.connect(uri);

      console.log('MongoDB connected');
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }

  // Additional database functions can be added here if necessary
}

module.exports = DbConnection;
