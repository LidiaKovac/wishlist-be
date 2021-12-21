//PASSPORT CONFIG
require("dotenv").config();
const { GOOGLE_ID, GOOGLE_SECRET } = process.env;
const userSchema = require("../services/user/schema");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

module.exports = () =>
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        callbackURL: "http://localhost:3001/api/user/callback",
        passReqToCallback: true,
      },
      async function (req, accessToken, refreshToken, profile, cb) {
        userSchema.find({ googleID: profile.id }, async (err, user) => {
          if (user) {
            console.log("🌚 Passport initialized");
            //console.log(user);
            if (user.length === 0) {
              console.log("🌝 User not found.. Creating!");
              //console.log(profile);
              await userSchema.create({
                name: profile.displayName,
                googleID: profile.id,
                propic: profile.photos[0].value,
                favs: [],
              });
              cb(err, user[0]);
            } else {
              cb(err, user[0]);
            }
            req.user = profile;
          } else console.error(err);
        });
      }
    )
  );
passport.serializeUser(function (user, next) {
  next(null, user);
});
