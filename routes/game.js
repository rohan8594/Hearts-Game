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

router.post('/playCard', isAuthenticated, (req, res) => { 
    card_id = req.card_id;
    user = req.user;
    game = req.game;
    
    update(game_id);
});


gameSocket.on('connection', (socket) => {

    socket.join(game_id);

    checkGameReady( game_id)
        .then((results) => {
            if (results == true){
                return prepareCards(game_id)
                    .then(() => {
                        return Game.getUserNamesFromGame(game_id)
                            .then((username) => {
                                console.log(username);
                                gameSocket.to(game_id).emit('LOAD PLAYERS', { game_players : username});
                                setTimeout(() => {
                                    return update(game_id);
                                }, 500)
                            })
                    })
            } else {
                return Game.getUserNamesFromGame(game_id)
                    .then((username) => {
                        gameSocket.to(game_id).emit('LOAD PLAYERS', { game_players : username});
                        setTimeout(() => {
                            return update(game_id);
                        }, 500)
                    })
            }
        });

    socket.on('GET PLAYER HAND', (data) => {
        const { user_id, game_id } = data;

        Game.getPlayerCards(user_id, game_id)
            .then((player_hand) => {

                socket.emit('SEND PLAYER HAND', { player_hand: player_hand, turnState: 'pass' } );
            })

    });

    socket.on('PASS CARDS', (data) => {
        const { user_id, game_id, passed_cards } = data;

        let card1 = parseInt(passed_cards[0]),
            card2 = parseInt(passed_cards[1]),
            card3 = parseInt(passed_cards[2]);

        Game.verifyUserHasCards(user_id, game_id, [card1, card2, card3])
            .then((exits) => {
                if (exits === true) {
                    // insert cards into passed_cards table
                    Game.addToPassedCardsTable(user_id, game_id, [card1, card2, card3]);
                    // set owner of those cards in user_game_cards to 0
                    setTimeout(() => {
                        [card1, card2, card3].forEach((card) => {
                            Game.setOwnerOfCard(card, null, game_id)
                        })
                    }, 100)
                } else {
                    // notify user that either he doesn't have these cards or they are already passed
                }
            })
    })

});


// game logic related functions
const checkGameReady = (game_id) => {
    return Game.checkGameStateExists(game_id)
        .then((exists) => {
            if (exists === false) {
                return Game.maxPlayers(game_id)
                    .then((results) => {
                        const max_players = results[0].max_players;

                        return Game.getPlayerCount(game_id)
                            .then((player_count) => {
                                // check if game room is full to start game
                                return Promise.resolve(player_count == max_players);
                            })
                    })
                    .catch((error) => { console.log(error) });
            }
        })

};

const prepareCards = (game_id) => {
    return Game.initializeUserGameCards(game_id)
        .then(() => {
            Game.dealCards(game_id);
            return Promise.resolve(game_id);
        })
};

const update = (game_id) => {
    return Game.getSharedInformation(game_id)
        .then((shared_player_information) => {
            return Game.getCurrentTurn(game_id)
                .then((current_turn) => {
                    gameSocket.to(game_id).emit('UPDATE',  {shared_player_information : shared_player_information, current_turn : current_turn});
                    console.log(current_turn);
                    return Promise.resolve(shared_player_information);
                })
        })
};

module.exports = router;