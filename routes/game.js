const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('game', { title: 'Hearts Game' });
});

router.get('/:game_id', (req, res) => {
    if (req.isAuthenticated()) {
        const { user } = req;

        res.render('game', { user: user });
    } else {
        res.redirect('/');
    }
});

module.exports = router;