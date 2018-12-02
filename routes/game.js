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
    // Game logic
    socket.join(game_id);

    const InitGame = (game_id, player_count) => {
        Game.initializeUserGameCards(game_id)
            .then(() => {
                Game.getGamePlayers(game_id)
                    .then((players) => {
                        const playersArr = [];
                        players.forEach(player => playersArr.push(player.user_id));
                        console.log(playersArr);

                        Game.dealCards(game_id, player_count, playersArr)
                    })
            })
    };

    // Check if game state is already present in DB or not
    Game.checkGameStateExists(game_id)
        .then((exists) => {
            if (exists === false) {
                Game.maxPlayers(game_id)
                    .then((count) => {
                        const { max_players } = count;

                        Game.getPlayerCount(game_id)
                            .then((player_count) => {
                                // check if game room is full to start game
                                if (player_count == max_players) {
                                    // Init Game
                                    InitGame(game_id, player_count)
                                } else {
                                    // io.to(game_id).emit('Wait', {msg: 'Waiting for more players...'})
                                }
                            })
                    })
                    .catch((error) => { console.log(error) })
            } else {
                // Display current game state
            }
        })
});

module.exports = router;