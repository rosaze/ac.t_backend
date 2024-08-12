const express = require('express');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config();

const passport = require('passport'); // 경로 수정
const connectDB = require('../config/database');

const startServer = async () => {
  const app = express();

  app.set('port', process.env.PORT || 3000);
  app.set('view engine', 'html');
  nunjucks.configure('views', {
    express: app,
    watch: true,
  });

  // 데이터베이스 연결
  await connectDB();

  app.use(morgan('dev'));
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // 인증 미들웨어 설정
  require('../passport/passport')(); // passport 초기화 함수 호출
  app.use(passport.initialize());

  // 라우터 설정
  const usersRouter = require('../routes/userRoutes');
  //const commentsRouter = require('../routes/comments');
  const postRoutes = require('../routes/postRoutes');
  const authRouter = require('../routes/auth');
  const chatRoutes = require('../routes/chatRoutes');
  const eventRoutes = require('../routes/eventRoutes');
  const hashtagRoutes = require('../routes/hashtagRoutes');
  const mateRoutes = require('../routes/mateRoutes');
  const badgeRoutes = require('../routes/badgeRoutes');
  const activityMapRoutes = require('../routes/activityMapRoutes');
  const preferenceRoutes = require('../routes/preferenceRoutes');

  app.use('/api/users', usersRouter);
  //app.use('/api/comments', commentsRouter);
  app.use('/api/posts', postRoutes);
  app.use('/api/auth', authRouter);
  //app.use('/api/chats', chatRoutes);
  //app.use('/api/events', eventRoutes);
  //app.use('/api/hashtags', hashtagRoutes);
  //app.use('/api/mates', mateRoutes);
  app.use('/mypage/profile', usersRouter);
  app.use('/mypage/badges', badgeRoutes);
  app.use('/mypage/activitymap', activityMapRoutes);
  app.user('/mypage/preference', preferenceRoutes);

  // 404 핸들링
  app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });

  // 에러 핸들링
  app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
  });

  // 서버 실행
  app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
  });
};

module.exports = startServer;
