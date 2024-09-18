const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authorize = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Authorization header:', authHeader);

  if (!authHeader) {
    console.log('Authorization 헤더가 없음');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Extracted token:', token);

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

    if (!decoded.id) {
      console.log('토큰에 사용자 ID가 없음');
      return res.status(401).json({ message: 'Invalid token structure' });
    }

    const user = await User.findById(decoded.id);
    console.log('Found user:', user);

    if (!user) {
      console.log('사용자를 찾을 수 없음');
      return res.status(401).json({ message: 'User not found' });
    }

    const isAdmin = user.isDeveloper || user.isAdmin;
    console.log('사용자 관리자 권한:', isAdmin);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      isAdmin: isAdmin,
    };

    console.log('req.user set to:', req.user);

    next();
  } catch (err) {
    console.log('토큰 검증 실패:', err.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authorize;
