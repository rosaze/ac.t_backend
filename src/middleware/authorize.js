const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.log('Authorization 헤더가 없음');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    console.log('Bearer 이후에 토큰이 없음');
    return res
      .status(401)
      .json({ message: 'Token is missing after Bearer keyword' });
  }

  try {
    console.log('토큰 검증 시도');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('디코딩된 토큰 정보:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('토큰 검증 실패:', err.message); // 이 로그가 출력되는지 확인
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authorize;
