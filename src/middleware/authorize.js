const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {
  const authHeader = req.header('Authorization'); // Authorization 헤더 추출
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', ''); // Bearer 문자열 제거

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Token is missing after Bearer keyword' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 토큰에서 유저 정보를 추출하여 req.user에 저장
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authorize;
