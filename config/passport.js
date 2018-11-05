const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../db');

passport.serializeUser((user, done) => {
   done(null, user.user_id)
});

passport.deserializeUser((user_id, done) => {
    db.one('SELECT * FROM users WHERE user_id = $1', [user_id])
        .then(({ user_id, username }) => done(null, { user_id, username }))
        .catch((error) => done(error))
});

passport.use(new LocalStrategy(
    (username, password, done) => {
        db.one('SELECT * FROM users WHERE username = $1', [username])
            .then(({ user_id, username, password: hash }) => {
                if (bcrypt.compareSync(password, hash)) {
                    return done(null, { user_id, username });
                } else {
                    return done(null, false, { message: 'Incorrect username or password.' });
                }
            })
            .catch((error) => done(error))
    }
));

module.exports = passport;