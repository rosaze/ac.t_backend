const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from the .env file
dotenv.config();

// MongoDB 연결 설정
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB 연결에 성공하였습니다.'))
  .catch((error) => console.log('MongoDB 연결에 실패하였습니다.', error));

const db = mongoose.connection;

// 에러 핸들링
db.on('error', console.error.bind(console, 'connection error:'));

// MongoDB 연결 객체를 내보냅니다
module.exports = db;
