const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect('/lobby');
  } else {
    res.render('login');
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/lobby',
  failureRedirect: '/',
}));

module.exports = router;