const express = require('express');
const router = express.Router();
const isAuthenticated = require('../config/passport/isAuthenticated');

/* GET home page. */
router.get('/', isAuthenticated, (req, res, next) => {
    res.render('game', { title: 'Hearts Game' });
});

router.get('/:game_id', isAuthenticated, (req, res) => {
    const { user } = req;
    const { game_id } = req.params;

    res.render('game', { user: user, game_id: game_id });
});

module.exports = router;