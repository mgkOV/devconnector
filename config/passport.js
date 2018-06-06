const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('./keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.jwtSecret;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, async ({ id }, done) => {
      try {
        const user = await User.findById(id);
        if (user) {
          return done(null, user);
        }

        return done(null, false);
      } catch (e) {
        return done(err, false);
      }
    })
  );
};
