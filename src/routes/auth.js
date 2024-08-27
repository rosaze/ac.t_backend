const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendAuthNumber } = require('../passport/EmailService'); // 올바른 경로로 수정
const passport = require('passport');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const router = express.Router();

// 메모리에 인증번호를 저장하는 객체
const authNumbersStorage = {};

// 인증번호 저장 함수
const saveAuthNumberToStorage = (email, authNumber) => {
  authNumbersStorage[email] = authNumber;
};

// 인증번호 조회 함수
const getAuthNumberFromStorage = (email) => {
  return authNumbersStorage[email];
};

// 토큰 생성 함수들
const generateAccessToken = (user) => {
  console.log('Access 토큰 생성 - 사용된 SECRET:', JWT_SECRET);
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: '1h',
  });
};

const generateRefreshToken = (user) => {
  console.log('Refresh 토큰 생성 - 사용된 SECRET:', JWT_REFRESH_SECRET);
  return jwt.sign({ id: user._id, email: user.email }, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

// 이메일 인증번호 전송 라우트
router.post('/send-email', async (req, res) => {
  const { email } = req.body;

  try {
    const authNumber = await sendAuthNumber(email);
    saveAuthNumberToStorage(email, authNumber); // 인증번호 저장
    res.status(200).json({ message: 'Authentication number sent', authNumber });
  } catch (error) {
    console.error('Failed to send authentication email:', error.message);
    res.status(500).json({ message: 'Failed to send authentication email' });
  }
});

// 이메일 인증번호 확인 라우트
router.post('/verify-email', async (req, res) => {
  const { email, inputAuthNumber } = req.body;

  try {
    const authNumber = getAuthNumberFromStorage(email); // 인증번호 조회

    if (!authNumber || authNumber !== inputAuthNumber) {
      return res.status(400).json({ message: 'Invalid authentication number' });
    }

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Failed to verify authentication number:', error.message);
    res.status(500).json({ message: 'Failed to verify authentication number' });
  }
});

// 회원가입 - 추가 정보 입력 및 사용자 생성
router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;

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
      phone, // 전화번호 추가
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during user registration:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 로그인 라우트
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // refresh token을 콘솔에 출력
    console.log('로그인 - 생성된 refreshToken:', refreshToken);

    // DB에 refresh token 저장
    user.refreshToken = refreshToken;
    await user.save();

    // 쿠키로 refresh token을 설정하고 응답
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.status(200).json({ accessToken, userId: user._id });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 카카오 회원가입 및 로그인
router.get('/kakao', (req, res) => {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code`;
  res.redirect(kakaoAuthUrl);
});

// 카카오 인증 후 콜백 처리
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
      // 기존 사용자라면 JWT 토큰 발급
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      return res.json({ token, user });
    } else {
      // 새로운 사용자라면 추가 정보 입력 페이지로 이동
      return res.status(200).json({
        message: 'Additional info required',
        kakaoId: id,
        name: nickname, // 카카오에서 가져온 닉네임 저장
        email,
      });
    }
  } catch (error) {
    console.error('카카오 인증 중 오류:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 회원가입 후 추가 정보 입력 라우트 (이메일, 카카오 공통)
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

// 카카오 회원가입 후 추가 정보 입력 처리
router.post('/kakao/register', async (req, res) => {
  const { kakaoId, email, nickname, gender, age, bio } = req.body;

  try {
    let user = await User.findOne({ kakaoId });
    if (!user) {
      user = new User({ kakaoId, email, nickname, gender, age, bio });
      await user.save();
    }

    const token = generateAccessToken(user);

    res.status(200).json({ token, user });
  } catch (error) {
    console.error('Error during Kakao registration:', error.message);
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
    console.log('No refresh token provided');
    return res.status(403).json({ message: 'Refresh token is required' });
  }

  try {
    console.log('Received refreshToken:', refreshToken);

    const user = await User.findOne({ refreshToken });

    if (!user) {
      console.log('No user found with the provided refresh token');
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        console.log('JWT verification failed:', err.message);
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      console.log('JWT verification successful, decoded:', decoded);

      const newAccessToken = generateAccessToken(user);

      res.status(200).json({
        accessToken: newAccessToken,
        userId: user._id, // userId 추가 반환
      });
    });
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
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
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
    });
  } catch (error) {
    console.error('로그아웃 에러:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
