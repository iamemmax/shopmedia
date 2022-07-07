// const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const userSchema = require("../model/users/UserSchema");

const crypto = require("crypto");


module.exports = passportAuth = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRETE,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile)
    crypto.randomBytes(10, async (err, buffer) => {
      let token = buffer.toString("hex");
   
    userSchema.findOrCreate({ googleId: profile.id,  user_id:`user_id${token}`, verified:true, email:profile.emails[0].value, username: token+profile.name.givenName, fullname:profile.displayName}, function (err, user) {
    
      
      return cb(err, user);

    });
    });
    
  }
))
  

//@facebook
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRETE,
  callbackURL: "http://localhost:5000/api/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'photos', 'email']
},
function(accessToken, refreshToken, profile, cb) {
  // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
  //   return cb(err, user);
  // });
  console.log(profile)
}
));

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    userSchema.findById(id, (err, user) => {
      done(err, user);
    });
  });
};