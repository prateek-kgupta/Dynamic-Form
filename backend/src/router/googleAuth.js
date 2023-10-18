const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/user/auth/google/callback",
      passReqToCallback: true,
      session: false,
    },
    function (request, accessToken, refreshToken, profile, done) {
      // console.log(profile)
      done(null, profile);
    }
  )
);

// passport.serializeUser((user, done) => {
//   console.log("Serialize", user);
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   console.log("Deserialize", user);
//   done(null, user);
// });
