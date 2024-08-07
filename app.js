const express = require("express");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv"); //추가
dotenv.config(); //추가
const passport = require("./src/passport/passport");
const connect = require("./src/config/database");

const usersRouter = require("./src/routes/users");
const commentsRouter = require("./src/routes/comments");
const postRoutes = require("./src/routes/postRoutes");
const authRouter = require("./src/routes/auth");
const recommendationRouter = require("./src/routes/recommendation");
const chatRoutes = require("./src/routes/chatRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const hashtagRoutes = require("./src/routes/hashtagRoutes");
const mateRoutes = require("./src/routes/mateRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const badgeRoutes = require("./src/routes/badgeRoutes");
const activityMapRoutes = require("./src/routes/activityMapRoutes");

const app = express();
app.set("port", process.env.PORT || 3002);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

connect(); //몽구스를 통해 몽고디비에 연결

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//인증 미들웨어 설정
app.use(passport.initialize());

//라우터설정 (추가)
app.use("/users", usersRouter);
app.use("/comments", commentsRouter); //
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/chats", chatRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/hashtags", hashtagRoutes);
app.use("/api/mates", mateRoutes);
app.use("/mypage/profile", profileRoutes);
app.use("/mypage/badges", badgeRoutes);
app.use("/mypage/activitymap", activityMapRoutes);

//404 핸들
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

//에러 핸들
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

//서버 실행
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
