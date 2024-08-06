const mongoose = require("mongoose");

const connect = () => {
  if (process.env.NODE_ENV !== "production") {
    // 배포가 아니라 개발일때(디버그 모드)
    mongoose.set("debug", true);
  }
  mongoose
    .connect("mongodb://root:nodejsbook@localhost:27017/admin", {
      dbName: "actapp", //주소 앞에 아이디:비밀번호. 위 주소로 몽고디비에 연결
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("몽고디비 연결 성공");
    })
    .catch((err) => {
      console.error("몽고디비 연결 에러", err);
    });
};

mongoose.connection.on("error", (error) => {
  console.error("몽고디비 연결 에러", error);
});
mongoose.connection.on("disconnected", () => {
  console.error("몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.");
  connect(); // 연결 재시도 하는 코드
});

module.exports = connect;
