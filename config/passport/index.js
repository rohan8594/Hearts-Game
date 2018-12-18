const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../../db/user');

passport.serializeUser((user, done) => {
  done(null, user.user_id)
});

passport.deserializeUser((user_id, done) => {
  User.findById(user_id)
    .then(({ user_id, username }) => done(null, { user_id, username }))
    .catch((error) => done(error))
});

passport.use(new LocalStrategy(
  (username, password, done) => {
    User.findByUsername(username)
      .then(({ user_id, username, password: hash }) => {
        if (bcrypt.compareSync(password, hash)) {
          return done(null, { user_id, username });
        } else {
          return done(null, false, { message: 'Incorrect username or password.' });
        }
      })
      .catch((error) => done(null, false, { error }))
  }
));

module.exports = passport;