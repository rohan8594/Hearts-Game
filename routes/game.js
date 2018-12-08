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
    //if there is no game, do not join the game or querry.
    if(game_id == null) { 
        return;
        //add redirect to lobby, message game no longer exists.
    }

    socket.join(game_id);

    if(checkGameReady( game_id)){        
        prepareCards(game_id)
            .then(() => {           
                gameSocket.to(game_id).emit('LOAD PLAYERS', { game_players : extractUserNames(game_id)});
                update(game_id);
            })
    } else{
        Game.getUserNamesFromGame(game_id)
            .then((username) => {
                gameSocket.to(game_id).emit('LOAD PLAYERS', { game_players : username});
            })
            
        update(game_id);     
    }
});


socket.on('GET PLAYER HAND', (data) => {
    const { user_id, game_id } = data;

    console.log('Player: ' + user_id);
    console.log('Game: ' + game_id);
});


const update = (game_id) => {
    Game.getSharedInformation(game_id)
        .then((shared_player_information) => {
            gameSocket.to(game_id).emit('UPDATE',  {shared_player_information : shared_player_information});
        })
}

const checkGameReady = (game_id) => {
    Game.checkGameStateExists(game_id)
        .then((exists) => {
            if (exists === false) {
                Game.maxPlayers(game_id)
                    .then((count) => {
                        const { max_players } = count;

                        Game.getPlayerCount(game_id)
                            .then((player_count) => {
                                // check if game room is full to start game
                                return (player_count == max_players)
                            })
                    })
                }
        })
}

const prepareCards = (game_id) => {
    Game.initializeUserGameCards(game_id)
        .then(() => {
            Game.dealCards(game_id)
        })
}

module.exports = router;
