const express = require('express');
const router = express.Router();
const isAuthenticated = require('../config/passport/isAuthenticated');
const io = require('../sockets');
const gameSocket = io.of('/game');
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

gameSocket.on('connection', (socket) => {
    // Game logic will prob go here
    socket.join(game_id.toString());
    gameSocket.to(game_id.toString()).emit('Entered game', { user: user, game_id: game_id });

    socket.on('disconnect', () => {
        if(typeof game_id !== 'undefined') {
            gameSocket.to(game_id).emit('Left game', { user: user, game_id: game_id });

            Game.deleteGamePlayer(user.user_id, game_id)
                .then(() => {
                    Game.getPlayerCount(game_id)
                        .then((player_count) => {

                            if (player_count < 1) {
                                Game.deleteGame(game_id)
                            }

                        })
                })
        }
    })
});

module.exports = router;