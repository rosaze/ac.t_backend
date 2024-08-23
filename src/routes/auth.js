const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendAuthNumber } = require('../passport/EmailService');
const axios = require('axios');

const router = express.Router();

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
        name,
      });

      await newUser.save();

      // 세션에서 임시 데이터 삭제
      req.session.tempUser = null;
      req.session.authCode = null;

      res.status(201).json({ message: 'User registered successfully' });
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
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.gender || !user.age) {
      return res
        .status(200)
        .json({ message: 'Additional info required', userId: user._id });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 이메일 추가 정보 입력
router.post('/email/register', async (req, res) => {
  const { userId, name, gender, age, bio } = req.body;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    user.gender = gender;
    user.age = age;
    user.bio = bio;

    await user.save();

    res
      .status(200)
      .json({ message: 'Additional info saved', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      properties: { nickname },
      kakao_account: { email },
    } = userResponse.data;

    let user = await User.findOne({ kakaoId: id });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      return res.json({ token, user });
    }

    res.status(200).json({
      message: 'Additional info required',
      kakaoId: id,
      name: nickname,
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

    res
      .status(200)
      .json({ message: 'Additional info saved', userId: user._id });
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

module.exports = router;

//성별, 나이 입력 + 취향 -> 프론트에서 api 전달해주면 백에서 반영하는 방식으로 변형 예정
