const express = require('express');
const router = express.Router();

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

module.exports = router;