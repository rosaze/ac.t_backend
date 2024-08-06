const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/user');
const router = express.Router();

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

// 회원가입
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 카카오 로그인 페이지로 리다이렉트
router.get('/kakao', (req, res) => {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  res.redirect(kakaoAuthUrl);
});

// 카카오 인증 후 리다이렉트 URI
router.get('/kakao/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // 토큰 요청
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: KAKAO_CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          code,
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // 사용자 정보 요청
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id } = userResponse.data;

    // 기존 사용자 확인
    let user = await User.findOne({ kakaoId: id });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      return res.json({ token, user });
    }

    // 신규 사용자일 경우 성별과 나이를 입력받는 페이지로 리다이렉트
    res.redirect(`/api/auth/kakao/register?kakaoId=${id}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 성별과 나이를 입력받는 페이지 -> 나중에 프론트에서 작성 후 백은 api받는 방식으로 수정 필요]
router.get('/kakao/register', (req, res) => {
  const { kakaoId } = req.query;
  res.send(`
    <form action="/api/auth/kakao/register" method="POST">
      <input type="hidden" name="kakaoId" value="${kakaoId}" />
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required /><br/>
      <label for="gender">Gender:</label>
      <select id="gender" name="gender" required>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select><br/>
      <label for="age">Age:</label>
      <input type="number" id="age" name="age" required /><br/>
      <button type="submit">Register</button>
    </form>
  `);
});

// 카카오 로그인 후 성별과 나이를 저장
router.post('/kakao/register', async (req, res) => {
  const { kakaoId, name, gender, age } = req.body;

  try {
    let user = await User.findOne({ kakaoId });
    if (!user) {
      user = new User({ kakaoId, name, gender, age });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
