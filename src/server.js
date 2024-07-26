const dotenv = require("dotenv");

dotenv.config();

const startServer = require("./loaders"); // loaders/index.js 모듈 임포트

startServer(); // 서버 시작
