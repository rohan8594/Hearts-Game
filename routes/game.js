const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('game', { title: 'Hearts Game' });
});

router.get('/:game_id', (req, res) => {
    if (req.isAuthenticated()) {
        const { user } = req;
        const { game_id } = req.params;

        res.render('game', { user: user, game_id: game_id });
    } else {
        res.redirect('/');
    }
});

module.exports = router;