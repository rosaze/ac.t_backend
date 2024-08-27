const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendAuthNumber } = require('../passport/EmailService');
const passport = require('passport');
const JWT_SECRET = `${process.env.JWT_SECRET}`;
const JWT_REFRESH_SECRET = `${process.env.JWT_REFRESH_SECRET}`;

const router = express.Router();

const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });
};

const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

router.post('/register', async (req, res) => {
  const { email, password, phone, name } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // 인증 코드 생성 및 이메일 발송
    const authCode = await sendAuthNumber(email);
    console.log('Generated authCode:', authCode);

    // 임시 사용자 정보와 인증 코드를 세션에 저장
    req.session.tempUser = { email, password, phone, name };
    req.session.authCode = authCode.toString();

    res.status(200).json({ message: 'Verification code sent to email' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  //테스트 완료
  const { authCode } = req.body;
  console.log('Received authCode:', authCode);
  console.log('Session authCode:', req.session.authCode);

  if (authCode === req.session.authCode) {
    const { email, password, phone, name } = req.session.tempUser;

    try {
      console.log('Attempting to create user with email:', email);
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        email,
        password: hashedPassword,
        phone,
        name,
      };

      // kakaoId 필드가 존재하면 userData에 추가
      if (req.session.tempUser.kakaoId) {
        userData.kakaoId = req.session.tempUser.kakaoId;
      }

      console.log('New user data:', userData);

      const newUser = new User(userData);
      await newUser.save();

      req.session.tempUser = null;
      req.session.authCode = null;

      return res
        .status(201)
        .json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
      console.error('Error creating user:', error.message);
      console.error('Detailed error:', error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(400).json({ message: 'Invalid verification code' });
  }
});

router.post('/login', async (req, res) => {
  //테스트 완료
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // JWT 토큰 생성
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });

    res.status(201).json({ success: true, accessToken, user });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/kakao', passport.authenticate('kakao'));

router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/');
  }
);

router.post('/kakao/register', async (req, res) => {
  const { kakaoId, email, name, gender, age, bio } = req.body;
  try {
    console.log('Kakao registration with kakaoId:', kakaoId);
    let user = await User.findOne({ kakaoId });
    if (!user) {
      user = new User({ kakaoId, email, name, gender, age, bio });
      console.log('New user data for Kakao:', user);
      await user.save();
    }
    res
      .status(200)
      .json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error('Error during Kakao registration:', error.message);
    console.error('Detailed error:', error); // MongoDB 에러에 대한 자세한 로그 출력
    res.status(500).json({ error: error.message });
  }
});

// 회원가입 후 추가 정보 입력 라우터 (닉네임, 한줄소개, 성별, 나이)
router.post('/additional-info', async (req, res) => {
  const { userId, nickname, bio, gender, age } = req.body;

  try {
    // 유저 정보 찾기
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 유저 정보 업데이트
    user.nickname = nickname; // nickname 별도로 저장
    user.bio = bio;
    user.gender = gender;
    user.age = age;

    await user.save();

    // 새로운 Access Token 생성
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // 밸런스 게임 페이지로 이동
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 밸런스 게임 페이지
router.post('/balance-game', async (req, res) => {
  const {
    userId,
    location_preference,
    environment_preference,
    group_preference,
    season_preference,
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.location_preference = location_preference;
    user.environment_preference = environment_preference;
    user.group_preference = group_preference;
    user.season_preference = season_preference;

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh Token으로 새로운 Access Token 발급
router.post('/token', async (req, res) => {
  const { refreshToken } = req.cookies; // 쿠키에서 Refresh Token 가져오기
  const connection = new DbConnection(); // 데이터베이스 연결 인스턴스

  if (!refreshToken) {
    return res.status(403).json({ message: 'Refresh token is required' });
  }

  try {
    const userToken = await connection.run(
      `SELECT * FROM user_token WHERE refresh_token=?`,
      [refreshToken]
    );

    if (!userToken || userToken.length === 0) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const newAccessToken = generateAccessToken(user);

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    connection.close(); // 데이터베이스 연결 종료
  }
});

// 로그아웃
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.cookies;

  try {
    const user = await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: null }
    );
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
