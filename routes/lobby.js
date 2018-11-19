const express = require("express");
const router = express.Router();
const io = require('../sockets');
const Game = require('../db/game');
const lobbySocket = io.of('/lobby');

const getRandomId = () => {
    return Math.round(Math.random() * 100000);
};

const displayGameList = () => {
    Game.getCurrentGames()
        .then((currentGames) => {
            lobbySocket.emit('display games list', currentGames);
        })
};

lobbySocket.on('connection', (socket) => {
    displayGameList()
});

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
    const { user } = req;
    const { max_players, game_name } = req.body;
    const game_id = getRandomId();

    Game.createGame(game_id, max_players, user.user_id, game_name)
        .then(() => {
            Game.createInitialGamePlayer(user.user_id, game_id)
                .then(() => {
                    displayGameList();
                    res.redirect(`/game/${game_id}`);
                })
                .catch((error) => { console.log(error) })
        })
        .catch((error) => { console.log(error) })
});

module.exports = router;