const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/user/auth/google/callback`,
      passReqToCallback: true,
      session: false,
    },
    function (request, accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

