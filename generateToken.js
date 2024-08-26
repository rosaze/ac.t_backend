const jwt = require("jsonwebtoken");

// 비밀 키 설정 (서버와 동일한 비밀 키 사용)
const secretKey = "your-secret-key";

// 페이로드 설정
const payload = {
  userId: "1234567890", // 예시 사용자 ID
  name: "John Doe",
  email: "johndoe@example.com",
};

// 옵션 설정 (토큰의 유효 기간 설정)
const options = {
  expiresIn: "1h", // 1시간 동안 유효한 토큰
};

// JWT 토큰 생성
const token = jwt.sign(payload, secretKey, options);

console.log("Generated JWT Token:", token);
