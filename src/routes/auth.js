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

// 성별과 나이를 입력받는 페이지
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

// 카카오 로그인 후 성별과 나이를 저장하고 밸런스 게임 페이지로 이동
router.post('/kakao/register', async (req, res) => {
  const { kakaoId, name, gender, age } = req.body;

  try {
    let user = await User.findOne({ kakaoId });
    if (!user) {
      user = new User({ kakaoId, name, gender, age });
      await user.save();
    }

    // 성별과 나이를 저장한 후 밸런스 게임 페이지로 리다이렉트
    res.redirect(`/balance-game?userId=${user._id}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 밸런스 게임 페이지
router.get('/balance-game', (req, res) => {
  const { userId } = req.query;
  // 여기서 실제 밸런스 게임 페이지를 제공해야 합니다.
  res.send(`
    <form action="/api/auth/balance-game" method="POST">
      <input type="hidden" name="userId" value="${userId}" />
      <h3>Choose your preferences:</h3>
      <label for="location_preference">Location Preference:</label>
      <select id="location_preference" name="location_preference" required>
        <option value="outdoor">Outdoor</option>
        <option value="indoor">Indoor</option>
      </select><br/>
      <label for="environment_preference">Environment Preference:</label>
      <select id="environment_preference" name="environment_preference" required>
        <option value="sea">Sea</option>
        <option value="mountain">Mountain</option>
      </select><br/>
      <label for="group_preference">Group Preference:</label>
      <select id="group_preference" name="group_preference" required>
        <option value="group">Group</option>
        <option value="individual">Individual</option>
      </select><br/>
      <label for="season_preference">Season Preference:</label>
      <select id="season_preference" name="season_preference" required>
        <option value="winter">Winter</option>
        <option value="summer">Summer</option>
      </select><br/>
      <button type="submit">Set Preferences</button>
    </form>
  `);
});

// 밸런스 게임 결과를 처리하여 취향 설정
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

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

//성별, 나이 입력 + 취향 -> 프론트에서 api 전달해주면 백에서 반영하는 방식으로 변형 예정
