const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

class DbConnection {
  constructor() {
    this.connect();
  }

  async connect() {
    try {
      await mongoose.connect(
        process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase'
      );
      console.log('MongoDB connected');
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }

  // 추가적인 데이터베이스 작업 함수들 필요시 추가 가능
}

module.exports = DbConnection;
