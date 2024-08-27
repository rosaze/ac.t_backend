const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendAuthNumber } = require('../passport/EmailService');
const passport = require('passport');
const JWT_SECRET = `${process.env.JWT_SECRET}`;
const JWT_REFRESH_SECRET = `${process.env.JWT_REFRESH_SECRET}`;

const router = express.Router();

// 토큰 생성 함수들
const generateAccessToken = (user) => {
  console.log('Access 토큰 생성 - 사용된 SECRET:', process.env.JWT_SECRET);
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const generateRefreshToken = (user) => {
  console.log(
    'Refresh 토큰 생성 - 사용된 SECRET:',
    process.env.JWT_REFRESH_SECRET
  );
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

// 회원가입 - 이메일 인증번호 전송
router.post('/send-email', async (req, res) => {
  const { email } = req.body;

  try {
    const authNumber = await sendAuthNumber(email);
    res.status(200).json({ message: 'Authentication number sent', authNumber });
  } catch (error) {
    console.error('Failed to send authentication email:', error.message);
    res.status(500).json({ message: 'Failed to send authentication email' });
  }
});

// 회원가입 - 이메일 인증번호 확인 후 추가 정보 입력
router.post('/register', async (req, res) => {
  const { email, password, name, authNumber, inputAuthNumber } = req.body;

  if (authNumber !== inputAuthNumber) {
    return res.status(400).json({ message: 'Invalid authentication number' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during user registration:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
      },
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 카카오 로그인 라우트
router.post('/kakao/register', async (req, res) => {
  const { kakaoId, email, name, gender, age, bio } = req.body;
  try {
    console.log('Kakao registration with kakaoId:', kakaoId);
    let user = await User.findOne({ kakaoId });
    if (!user) {
      user = new User({ kakaoId, email, name, gender, age, bio });
      await user.save();
    }
    res
      .status(200)
      .json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error('Error during Kakao registration:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 회원가입 후 추가 정보 입력 라우트
router.post('/additional-info', async (req, res) => {
  const { userId, nickname, bio, gender, age } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.nickname = nickname;
    user.bio = bio;
    user.gender = gender;
    user.age = age;

    await user.save();

    const token = generateAccessToken(user);

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

    user.preference = {
      location: location_preference,
      environment: environment_preference,
      group: group_preference,
      season: season_preference,
    };

    await user.save();

    const token = generateAccessToken(user);

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh Token으로 새로운 Access Token 발급
router.post('/token', async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(403).json({ message: 'Refresh token is required' });
  }

  try {
    console.log('Received refreshToken:', refreshToken);

    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          console.log('JWT verification failed:', err.message);
          return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken(user);

        res.status(200).json({ accessToken: newAccessToken });
      }
    );
  } catch (error) {
    console.error('Error during token processing:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 로그아웃 라우트
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    console.log('로그아웃 요청 - refreshToken 없음');
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    console.log('로그아웃 요청 - 받은 refreshToken:', refreshToken);

    // JWT 검증
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          console.log('JWT 검증 실패:', err.message);
          return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // DB에서 해당 리프레시 토큰을 가진 사용자 찾기
        const user = await User.findOne({ refreshToken });

        if (!user) {
          console.log('해당 refreshToken을 가진 사용자 없음');
          console.log(
            '데이터베이스에 저장된 refreshToken:',
            user ? user.refreshToken : '사용자 없음'
          );
          return res.status(403).json({ message: 'Invalid refresh token' });
        }

        console.log('찾은 사용자의 refreshToken:', user.refreshToken);
        console.log(
          '요청된 refreshToken과 일치 여부:',
          user.refreshToken === refreshToken
        );

        // 로그아웃 처리: refreshToken 삭제
        user.refreshToken = null;
        await user.save();

        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out successfully' });
      }
    );
  } catch (error) {
    console.error('로그아웃 에러:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
