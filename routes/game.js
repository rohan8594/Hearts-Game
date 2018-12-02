const express = require('express');
const router = express.Router();
const isAuthenticated = require('../config/passport/isAuthenticated');
const io = require('../sockets');
// const gameSocket = io.of('/game');
const Game = require('../db/game');

let user;
let game_id;

router.get('/', isAuthenticated, (req, res, next) => {
    res.render('game', { title: 'Hearts Game' });
});

router.get('/:game_id', isAuthenticated, (req, res) => {
    user = req.user;
    game_id = req.params.game_id;

    res.render('game', { user: user, game_id: game_id });
});

io.on('connection', (socket) => {
    // Game logic
    socket.join(game_id);

    Game.maxPlayers(game_id)
        .then((count) => {
            const { max_players } = count;

            Game.getPlayerCount(game_id)
                .then((player_count) => {
                    // check if game room is full to start game
                    if (player_count == max_players) {
                        console.log('Game Full')
                        // Game.InitGame()
                    } else {
                        // io.to(game_id).emit('Wait', {msg: 'Waiting for more players...'})
                    }
                })
        })
        .catch((error) => { console.log(error) })
});

module.exports = router;