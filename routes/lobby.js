const express = require("express");
const router = express.Router();
const io = require('../sockets');
const Game = require('../db/game');

const getRandomId = () => {
    return Math.round(Math.random() * 100000);
};

/* GET lobby page. */
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        const { user } = req;

        res.render('lobby', {user: user, title: 'Hearts Game'});
    } else {
        res.redirect('/');
    }
});

router.post('/createGame', (req, res) => {
    const { user_id, username, max_players, game_name } = req.body;
    const game_id = getRandomId();

    Game.createGame(game_id, max_players, user_id, game_name)
        .then(() => {
            Game.createInitialGamePlayer(user_id, game_id)
                .then(() => {
                    io.emit('broadcast game', game_id);
                    // res.redirect(`/game/${game_id}`);
                })
                .catch((error) => { console.log(error) })
        })
        .catch((error) => { console.log(error) })
});

module.exports = router;