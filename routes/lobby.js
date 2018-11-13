const express = require("express");
const router = express.Router();
const db = require('../db');

/* GET home page. */
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        const { user } = req;
        console.log(user);
        res.render('lobby', {user: user, title: 'Hearts Game'});
    } else {
        res.redirect('/');
    }
});

router.post('/', (req, res) => {
    res.redirect('/game');
});

module.exports = router;