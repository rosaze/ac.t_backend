const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const User = require('../models/User');

// 카카오 인증 전략 설정
passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ kakaoId: profile.id });

        if (!user) {
          // 신규 유저일 경우 DB에 저장
          user = new User({
            kakaoId: profile.id,
            email: profile._json.kakao_account.email,
            name: profile.displayName,
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err));
});

// passport 모듈 내보내기
module.exports = passport;
