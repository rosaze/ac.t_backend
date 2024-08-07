const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const User = require('../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_CLIENT_ID,
        callbackURL: process.env.REDIRECT_URI,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await User.findOne({ kakaoId: profile.id });
          if (exUser) {
            return done(null, exUser);
          }
          const newUser = await User.create({
            kakaoId: profile.id,
            name: profile.displayName,
            email: profile._json.kakao_account.email,
          });
          return done(null, newUser);
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );
};
