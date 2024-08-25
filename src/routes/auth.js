const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendAuthNumber } = require('../passport/EmailService');
const axios = require('axios');
const session = require('express-session');
const DbConnection = require('../config/database'); // 데이터베이스 연결 모듈
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const router = express.Router();

// Access Token 및 Refresh Token 생성 함수
const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    nickname: user.nickname, // nickname 추가
    isMentor: user.isMentor,
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

// 이메일 회원가입 - 인증번호 발송
router.post('/register', async (req, res) => {
  const { email, password, phone, name } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // 인증 코드 생성 및 이메일 발송
    const authCode = sendAuthNumber(email, res);

    // 임시 사용자 정보와 인증 코드를 세션에 저장
    req.session.tempUser = { email, password, phone, name };
    req.session.authCode = authCode;

    res.status(200).json({ message: 'Verification code sent to email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 이메일 인증번호 확인 및 최종 회원가입
router.post('/verify', async (req, res) => {
  const { authCode } = req.body;

  if (authCode === req.session.authCode) {
    const { email, password, phone, name } = req.session.tempUser;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        password: hashedPassword,
        phone,
        name, // 이메일 회원가입 시 입력된 name 저장
      });

      await newUser.save();

      // 세션에서 임시 데이터 삭제
      req.session.tempUser = null;
      req.session.authCode = null;

      // 회원가입 후 추가 정보 입력 페이지로 이동
      res
        .status(201)
        .json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(400).json({ message: 'Invalid verification code' });
  }
});

// 이메일 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const connection = new DbConnection(); // 데이터베이스 연결 인스턴스

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // JWT 토큰 생성
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Refresh Token을 데이터베이스에 저장
    user.refreshToken = refreshToken;
    await user.save();

    // Refresh Token을 쿠키에 저장
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });

    // Access Token과 함께 응답
    res.status(201).json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    connection.close(); // 데이터베이스 연결 종료
  }
});

// 카카오 회원가입 및 로그인
router.get('/kakao', (req, res) => {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code`;
  res.redirect(kakaoAuthUrl);
});

router.get('/kakao/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_CLIENT_ID,
          redirect_uri: process.env.REDIRECT_URI,
          code,
        },
      }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const {
      id,
      properties: { name },
      kakao_account: { email },
    } = userResponse.data;

    let user = await User.findOne({ kakaoId: id });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      return res.json({ token, user });
    }

    // 카카오 회원가입 후 추가 정보 입력 페이지로 이동
    res.status(200).json({
      message: 'Additional info required',
      kakaoId: id,
      name: name, // 카카오 회원가입 시 name 저장
      email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/kakao/register', async (req, res) => {
  const { kakaoId, email, name, gender, age, bio } = req.body;

  try {
    let user = await User.findOne({ kakaoId });
    if (!user) {
      user = new User({ kakaoId, email, name, gender, age, bio });
      await user.save();
    }

    // 밸런스 게임 페이지로 이동
    res
      .status(200)
      .json({ message: 'Additional info saved', userId: user._id });
  } catch (error) {
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
