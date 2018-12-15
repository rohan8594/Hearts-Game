const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

const validateFields = (req, password) => {
  // Field validation
  req.checkBody('username_input', 'Username cannot be empty').notEmpty();
  req.checkBody('password_input', 'Password cannot be empty').notEmpty();
  req.checkBody('password_verify', 'Password verify cannot be empty').notEmpty();
  req.checkBody('password_verify', 'Passwords do not match').equals(password);

  return req.validationErrors();
};

router.get('/', function(req, res, next){
  res.render('registration')
});

router.post('/', (req, res) => {
  const {username_input: username, password_input: password} = req.body;
  const errors = validateFields(req, password);

  if (errors) {
    res.render('registration', {errors: errors});
  } else {
    bcrypt.hash(password, 10)
      .then((hash) => {
        db.none('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hash])
          .then(() => {
            res.render('login');
          })
          .catch((error) => {
            const { detail } = error;
            res.render('registration', { errors: [{
                msg: detail
              }]});
          })
      })
  }
});

module.exports = router;