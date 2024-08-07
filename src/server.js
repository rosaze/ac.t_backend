const dotenv = require('dotenv');

dotenv.config();

const startServer = require('./loaders'); // loaders/index.js 모듈 임포트

startServer(); // 서버 시작

//환경 변수를 로드하고 서버를 시작하는 역활
