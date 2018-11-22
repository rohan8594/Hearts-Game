const express = require("express");
const router = express.Router();
const io = require('../sockets');
const Game = require('../db/game');
const lobbySocket = io.of('/lobby');

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
        const passedError = req.query.error;

        res.render('lobby', {user: user, title: 'Hearts Game', error: passedError});
    } else {
        res.redirect('/');
    }
});

router.post('/createGame', (req, res) => {
    const { user } = req;
    const { max_players, game_name } = req.body;

    req.checkBody('game_name', 'Game name cannot be empty').notEmpty();
    const errors = req.validationErrors();

    if (errors) {
        const errStr = encodeURIComponent(errors[0].msg);
        res.redirect('/lobby?error=' + errStr);
    } else {
        Game.createGame(max_players, user.user_id, game_name)
            .then((results) => {
                const { game_id } = results[0];
                Game.createInitialGamePlayer(user.user_id, game_id)
                    .then(() => {
                        displayGameList();
                        res.redirect(`/game/${game_id}`);
                    })
                    .catch((error) => { console.log(error) })
            })
            .catch((error) => { console.log(error) })
    }
});

router.get('/logout', (req, res) => {
   req.logout();
   res.redirect('/');
});

router.post('/joinGame', (req, res) => {
    const { user } = req;
    const { join_btn: game_id } = req.body;
    Game.joinGame(user.user_id, game_id);
    displayGameList();
    res.redirect(`/game/${game_id}`);
});

router.post('/observeGame', (req, res) => {
    const { user } = req;
    const { watch_btn: game_id } = req.body;

    Game.observeGame(game_id);
    res.redirect(`/game/${game_id}`);
});

module.exports = router;