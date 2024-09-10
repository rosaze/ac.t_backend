const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const cors = require("cors");
const http = require("http"); // 추가
const socketIO = require("socket.io"); // 소켓 추가

require("dotenv").config(); //에러 수정

const passport = require("./src/passport/passport");
const EmailService = require("./src/passport/EmailService");
const DbConnection = require("./src/config/database");

const usersRouter = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
const authRouter = require("./src/routes/auth");
const chatRoutes = require("./src/routes/chatRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const productRoutes = require("./src/routes/productRoutes"); // 스토어 라우트 추가
const cartRoutes = require("./src/routes/cartRoutes");
const rentalRoutes = require("./src/routes/rentalRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const mateRoutes = require("./src/routes/mateRoutes");
const mentorRoutes = require("./src/routes/MentorRoutes");
const activityMapRoutes = require("./src/routes/mypageRoutes");
const vendorRoutes = require("./src/routes/vendorRoutes"); //업체명 저장 DB
const preferenceRoutes = require("./src/routes/preferenceRoutes");
const accommodationRoutes = require("./src/routes/accommodationRoutes");
const mypageRoutes = require("./src/routes/mypageRoutes"); // 마이페이지 라우트 추가
//중기 날씨 테스트용 라우터 (나중에 삭제해도 O)
const testRoutes = require("./src/routes/fcstMiddle");

const app = express();
app.use(cors()); // 모든 요청에 대해 CORS를 허용합니다.
app.set("port", process.env.PORT || 3000);
app.set("view engine", "html");

nunjucks.configure(path.join(__dirname, "src/views"), {
  autoescape: true,
  express: app,
});

app.set("view engine", "html");

// 서버 인스턴스 생성
const server = http.createServer(app); // 추가
const io = socketIO(server); // server 객체를 socket.io와 연결

new DbConnection(); //몽구스를 통해 몽고디비에 연결

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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
app.use(passport.session());

//라우터설정 (추가)
app.use("/api/users", usersRouter); //서빈//테스트 완료
app.use("/api/posts", postRoutes); //지원//테스트 중(일부기능만)
app.use("/api/auth", authRouter); //서빈 //테스트 완료 - 카카오로그인은 프론트애서 태스트
app.use("/api/chats", chatRoutes); //지원//테스트완료
app.use("/api/events", eventRoutes); //지원
app.use("/api/store", productRoutes); //서빈 // 스토어 라우트 설정
app.use("/api/store/payments", paymentRoutes); //서빈
app.use("/api/store/rental", rentalRoutes); //서빈
app.use("/api/store/cart", cartRoutes); //지원
app.use("/api/preference", preferenceRoutes); //서빈

//지원
app.use("/api/mates", mateRoutes); //지원
app.use("/api/mentor", mentorRoutes); //
app.use("/api/mypage", mypageRoutes); // 마이페이지 라우트 통합 //서빈 //테스트 완료
app.use("/api", vendorRoutes); // 업체명 라우트 추가 //지원
app.use("/api", accommodationRoutes); //숙박 라우트
app.use(testRoutes); // Add this to include your test route

/*
// 중기예보Schedule to fetch and save weather data every day at midnight (00:00)
schedule.scheduleJob("0 0 * * *", async () => {
  console.log("Scheduled job: Fetching and saving weather data...");
  try {
    await fetchAndSaveForecasts();
    console.log("Weather data saved successfully.");
  } catch (error) {
    console.error("Error in scheduled job:", error);
  }
});
*/

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
