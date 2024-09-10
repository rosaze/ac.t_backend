const jwt = require('jsonwebtoken');
const User = require('../models/user'); // User 모델 import

const authorize = async (req, res, next) => {
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

    // 데이터베이스에서 사용자 정보 가져오기
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('사용자를 찾을 수 없음');
      return res.status(401).json({ message: 'User not found' });
    }

    // 관리자 권한 확인
    const isAdmin = user.isDeveloper || user.isAdmin; // isDeveloper나 isAdmin 중 하나라도 true이면 관리자로 간주
    console.log('사용자 관리자 권한:', isAdmin);

    req.user = {
      ...decoded,
      isAdmin: isAdmin,
    };

    next();
  } catch (err) {
    console.log('토큰 검증 실패:', err.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authorize;
