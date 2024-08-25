const express = require("express");
const session = require("express-session");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv"); //추가
const http = require("http"); // 추가
const socketIO = require("socket.io"); // 소켓 추가
require("dotenv").config(); //에러 수정

const passport = require("./src/passport/passport");
const EmailService = require("./src/passport/EmailService");
const connect = require("./src/config/database");

const usersRouter = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
const authRouter = require("./src/routes/auth");
const chatRoutes = require("./src/routes/chatRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const productRoutes = require("./src/routes/productRoutes"); // 스토어 라우트 추가
const cartRoutes = require("./src/routes/cartRoutes");
const rentalRoutes = require("./src/routes/rentalRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const hashtagRoutes = require("./src/routes/hashtagRoutes");
const mateRoutes = require("./src/routes/mateRoutes");
const mentorRoutes = require("./src/routes/MentorRoutes");
const badgeRoutes = require("./src/routes/badgeRoutes");
const activityMapRoutes = require("./src/routes/activityMapRoutes");
const vendorRoutes = require("./src/routes/vendorRoutes"); //업체명 저장 DB
const preferenceRoutes = require("./src/routes/preferenceRoutes");
const accommodationRoutes = require("./routes/accommodationRoutes");
const imageRoutes = require("./src/routes/imageRoutes"); //이미지합성

const app = express();
app.set("port", process.env.PORT || 3002);
app.set("view engine", "html");

nunjucks.configure("src/views", {
  autoescape: true,
  express: app,
});

// 에러 처리 미들웨어
aapp.use((req, res, next) => {
  res
    .status(404)
    .render("views/error.html", { error: { message: "Page Not Found" } });
});

app.set("view engine", "html");
// 서버 인스턴스 생성
const server = http.createServer(app); // 추가
const io = socketIo(server); // server 객체를 socket.io와 연결

connect(); //몽구스를 통해 몽고디비에 연결

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 세션 설정
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // HTTPS 환경에서만 true로 설정
  })
);

//인증 미들웨어 설정
app.use(passport.initialize());

//라우터설정 (추가)
app.use("/api/users", usersRouter);
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/store", productRoutes); // 스토어 라우트 설정
app.use("api/store/payments", paymentRoutes);
app.use("api/store/rental", rentalRoutes);
app.use("api/store/cart", cartRoutes);

//지원
app.use("/api/hashtags", hashtagRoutes);
app.use("/api/mates", mateRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/mypage/badges", badgeRoutes);
app.use("/api/mypage/activitymap", activityMapRoutes);
app.use("/api/mypage/profile", usersRouter);
app.use("/api/mypage/preference", preferenceRoutes);
app.use("/api", vendorRoutes); // 업체명 라우트 추가
app.use("/api", accommodationRoutes); //숙박 라우트
app.use("/api/images", imageRoutes); // 이미지 관련 라우트

//socket.io 연결
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", ({ chatRoomId, userId }) => {
    socket.join(chatRoomId);
    console.log(`${userId} joined room ${chatRoomId}`);
  });

  socket.on("message", async ({ chatRoomId, message }) => {
    const savedMessage = await ChatService.sendMessage(
      chatRoomId,
      message.sender,
      message.content
    );
    io.to(chatRoomId).emit("message", savedMessage); // 채팅방에 메시지 전송
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

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
//app.listen 대신 server.listen으르 사용하여 서버 실행.
server.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
