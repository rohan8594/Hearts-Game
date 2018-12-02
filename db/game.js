const db = require('../db');

const createGame = (max_players, user_id, game_name) => {
    return db.query('INSERT INTO games (max_players, current_player, game_name) VALUES ' +
        '($1, $2, $3) RETURNING game_id', [max_players, user_id, game_name])
        .catch((error) => { console.log(error) })
};

const createInitialGamePlayer = (user_id, game_id) => {
    return db.none('INSERT INTO game_players (user_id, game_id, total_score, current_round_score, turn_sequence) VALUES ' +
        '($1, $2, $3, $4, $5)', [user_id, game_id, 0, 0, 1])
        .catch((error) => { console.log(error) })
};

const getCurrentGames = () => {
    return db.query('SELECT g.game_id, game_name, max_players, COUNT(*) as player_count ' +
        'FROM games g, game_players gp ' +
        'WHERE g.game_id=gp.game_id ' +
        'GROUP BY g.game_id ')
        .catch((error) => { console.log(error) })
};

const getPlayerCount = (game_id) => {
    return db.query('SELECT COUNT(*) as player_count ' +
        'FROM game_players ' +
        'WHERE game_id=$1', [game_id])
        .then((results) => { return results[0].player_count })
        .catch((error) => { console.log(error) })
};

const observeGame = (user_id, game_id) => {
    return db.none('INSERT into game_observers(user_id, game_id) ' +
        'VALUES ($1, $2)', [user_id, game_id])
        .catch((error) => { console.log(error) })
};

const joinGame =  (user_id, game_id) => {
    getPlayerCount(game_id)
        .then((player_count) => {
            return db.none('INSERT into game_players (user_id, game_id, total_score, current_round_score, turn_sequence) ' +
                'VALUES ($1, $2, $3, $4, $5)', [user_id, game_id, 0, 0, player_count + 1])
                .catch((error) => { console.log(error) })
        })
};

const deleteGame = (game_id) => {
    return db.none('DELETE FROM games WHERE game_id=$1', [game_id])
        .catch((error) => { console.log(error) })
};

const deleteGamePlayer = (user_id, game_id) => {
    return db.none('DELETE FROM game_players WHERE user_id=$1 AND game_id=$2', [user_id, game_id])
        .catch((error) => { console.log(error) })
};

const verifyInGame = (user_id, game_id) => {
    return db.query('SELECT MAX(count) as in_Game ' +
        'FROM ( ' +
        'SELECT COUNT(*) FROM game_players WHERE game_players.user_id = $1 AND game_players.game_id = $2 ' +
        'UNION ' +
	    'SELECT COUNT(*) FROM game_observers WHERE game_observers.user_id = $1 AND game_observers.game_id = $2 ' +
        ') as counts' , [user_id, game_id])
        .then((results) => {return results[0].in_game})
        .catch((error) => { console.log(error) })
};

const maxPlayers = (game_id) => {
    return db.one('SELECT max_players FROM games WHERE game_id=$1', [game_id])
        .then((count) => count)
};

const getPlayerCards = (user_id, game_id) => {
    return db.query('SELECT card_id FROM user_game_cards WHERE game_players.user_id = $1 AND game_id = $2', [user_id, game_id])
        .catch((error) => {console.log(error)})
};

const getCardCount = (user_id, game_id) => {
    return db.query('SELECT COUNT(card_id) FROM user_game_cards WHERE game_players.user_id = $1 AND game_id = $2', [user_id, game_id])
        .catch((error) => {console.log(error)})
};

const getPlayerTotalScore = (user_id, game_id) => {
    return db.query('SELECT total_score FROM game_players WHERE game_players.user_id = $1 AND game_id = $2', [user_id, game_id])
        .catch((error) => {console.log(error) })
};

const getPlayerRoundScore = (user_id, game_id) => {
    return db.query('SELECT current_round_score FROM game_players WHERE game_players.user_id = $1 AND game_id = $2', [user_id, game_id])
        .catch((error) => {console.log(error)})
};

const clearUserGameCards = (game_id) => {
    return db.none('DELETE FROM user_game_cards WHERE game_id = $1', [game_id])
        .catch((error) => {console.log(error)})
};

const initializeUserGameCards = (game_id) => {
    return db.none(
    'DO $$ ' +
    'BEGIN ' + 
      'FOR counter IN 1..52 LOOP ' +
        'INSERT INTO user_game_cards (game_id, card_id, in_play) ' +
        'VALUES ($1, counter, \'0\'); ' +
      'END LOOP; ' +
    'END; $$ ', [game_id] )
        .catch((error) => {console.log(error)})
};

const getUserNamesFromGame = (game_id) => {
    return db.query('SELECT username FROM users WHERE users.user_id IN ' +
        '(SELECT game_players.user_id FROM game_players WHERE game_players.game_id = $1)', [game_id])
        .catch((error) => {console.log(error)})
};

const getUserIDFromGame = (game_id) => {
    return db.query('SELECT user_id FROM game_players WHERE game_players.game_id = $1', [game_id])
        .catch((error) => {console.log(error)})
};

const getGamePlayers = (game_id) => {
    return db.query('SELECT * FROM game_players WHERE game_id = $1', [game_id])
        .catch((error) => {console.log(error)})
};

const getUserIDFromName = (user_id) => {

};

const getAllCardsFromGame = (game_id) => {
    return db.query('SELECT * from user_game_cards WHERE game_id = $1', [game_id])
        .catch((error) => {console.log(error)})
};

const dealCards = (game_id, number_players, playersArray) => {
    const promisesForRandomCards = [];
    getAllCardsFromGame(game_id)
        .then((results) => {
            let index;
            const cardsLeft = [];

            for(index = 0; index < results.length; index++){
                cardsLeft.push(results[index].card_id);
            }

            for(index = 0; index < results.length; index++){
                console.log(cardsLeft.length);
                let randomValue = Math.floor( Math.random() * cardsLeft.length );
                let card_assigned = cardsLeft.pop(randomValue);
                //console.log(card_assigned + " : " +  (index%number_players + 1) + "\n");
                //promisesForRandomCards.push( setOwnerOfCard(card_assigned, index%number_players + 1, game_id) );
                
                setOwnerOfCard(card_assigned, playersArray[index % number_players], game_id)
               
               // .then(() => )1
            }
        })
    //return Promise.all(promisesForRandomCards);   
};


const setOwnerOfCard = (card_id, user_id, game_id) => {
    return db.none('UPDATE user_game_cards ' + 
        'SET user_id = $1 ' +
        'WHERE card_id = $2 AND game_id = $3', [user_id, card_id, game_id])
        .catch((error) => {console.log(error)})
};


//returns values, cards, and user who played
const getCardsInPlay = (game_id) => {
    
};

const assignPoints = (game_id) => {

};

const passCards = (game_id, user_id, cards_passed, destination) => {

};

const playCard = (game_id, user_id, card_played) => {

};

module.exports = {
    createGame,
    createInitialGamePlayer,
    getCurrentGames,
    observeGame,
    joinGame,
    deleteGame,
    verifyInGame,
    getPlayerCards,
    getCardCount,
    getPlayerTotalScore,
    getPlayerRoundScore,
    getUserNamesFromGame,
    getUserIDFromName,
    dealCards,
    getCardsInPlay,
    assignPoints,
    passCards,
    playCard,
    initializeUserGameCards,
    getUserIDFromGame,
    getAllCardsFromGame,
    clearUserGameCards,
    deleteGamePlayer,
    getPlayerCount,
    maxPlayers,
    getGamePlayers
};