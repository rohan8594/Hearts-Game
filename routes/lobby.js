const express = require('express');
const router = express.Router();
const io = require('../sockets');

/* GET home page. */
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        const { user } = req;

        res.render('lobby', {user: user, title: 'Hearts Game'});
    } else {
        res.redirect('/');
    }
});

module.exports = router;