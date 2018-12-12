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
                'VALUES ($1, $2, $3, $4, $5)', [user_id, game_id, 0, 0, (parseInt(player_count) + 1)])
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
    return db.query('SELECT max_players FROM games WHERE game_id = $1', [game_id])
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
        'INSERT INTO user_game_cards (game_id, card_id) ' +
        'VALUES ($1, counter); ' +
      'END LOOP; ' +
    'END; $$ ', [game_id] )
        .catch((error) => {console.log(error)})
};

const getUserNamesFromGame = (game_id) => {
    return db.query('SELECT username, turn_sequence ' +
    'FROM users, game_players ' +
    'WHERE users.user_id = game_players.user_id AND game_players.game_id = $1 ' +
    'ORDER BY turn_sequence ', [game_id])
        .catch((error) => {console.log(error)})
};


const getAllCardsFromGame = (game_id) => {
    return db.query('SELECT * from user_game_cards WHERE game_id = $1', [game_id])
        .catch((error) => {console.log(error)})
};

const dealCards = (game_id) => {
    const player_array = [];
    getUserIDSortedByTurnSequence(game_id)
        .then((results) => {
            let number_players = results.length;
            for(index = 0; index < results.length; index++){
                player_array.push(results[index].user_id);
            }
            getAllCardsFromGame(game_id)
                .then((results) => {
                    let index;
                    const cardsLeft = [];

                    for(index = 0; index < results.length; index++){
                        cardsLeft.push(results[index].card_id);
                    }

                    for(index = 0; index < results.length; index++){
                        let randomValue = Math.floor( Math.random() * cardsLeft.length );
                        let card_assigned = cardsLeft[randomValue];
                        cardsLeft.splice(randomValue, 1);
                        setOwnerOfCard(card_assigned, player_array[index % number_players], game_id)
                    }
                })
        })
};

const setOwnerOfCard = (card_id, user_id, game_id) => {
    return db.none('UPDATE user_game_cards ' + 
        'SET user_id = $1 ' +
        'WHERE card_id = $2 AND game_id = $3', [user_id, card_id, game_id])
        .catch((error) => {console.log(error)})
};

const checkGameStateExists = (game_id) => {
    return db.query('SELECT * FROM user_game_cards WHERE game_id=$1', [game_id])
        .then((results) => {
            return !(results === undefined || results.length === 0);
        })
        .catch((error) => { console.log(error) })
};

const getCardCount = (user_id, game_id) => {
    return db.query('SELECT COUNT(card_id) FROM user_game_cards WHERE user_id = $1 AND game_id = $2 AND in_play = \'0\' ', [user_id, game_id])
        .catch((error) => {console.log(error)})
};

getUserIDSortedByTurnSequence = (game_id) => {
    return db.query('SELECT * FROM game_players WHERE game_id = $1 ORDER BY turn_sequence', [game_id])
        .catch((error) => {console.log(error)})
};

getSharedInformation = (game_id) => {
    return db.query(
        'SELECT  username, turn_sequence, ' +
        'current_round_score, total_score, ' +
        'cards_in_play.card_id AS card_in_play, count(DISTINCT user_game_cards.card_id) AS card_count ' +
        'FROM users, game_players, cards_in_play, user_game_cards ' + 
        'WHERE users.user_id = game_players.user_id ' + 
        'AND cards_in_play.game_id = $1 ' + 
        'AND game_players.game_id = $1 ' +
        'AND user_game_cards.user_id = users.user_id ' +
        'AND user_game_cards.game_id = $1 ' +
        'GROUP BY username, turn_sequence, current_round_score, total_score, cards_in_play.card_id ' +
        'ORDER BY turn_sequence', [game_id]
    )
};

const joinCardsInPlay = (user_id, game_id) => {
    return db.none(
        'INSERT INTO cards_in_play (user_id, game_id) ' +
        'VALUES ($1, $2)', [user_id, game_id])
            .catch((error) => {console.log(error)})
    
};

const getCurrentCards = ( game_id, user_id ) => {
    return db.query('SELECT card_id FROM user_game_cards WHERE user_id = $1', [user_id])
        .catch((error) => {console.log(error)})
};

const getUserIDFromGame = (game_id) => {
    return db.query('SELECT user_id FROM game_players WHERE game_players.game_id = $1', [game_id])
        .catch((error) => {console.log(error)})
};

const getUsernameFromID = (username) => {
    return db.query('SELECT username FROM users WHERE username = $1', [username])
        .catch((error) => {console.log(error)})
};

const getGamePlayers = (game_id) => {
    return db.query('SELECT * FROM game_players WHERE game_id = $1', [game_id])
        .catch((error) => {console.log(error)})
};

const getNameFromID = (user_id) => {
    return db.query('SELECT username FROM users WHERE user_id = $1', [user_id])
};

const getPlayerCards = (user_id, game_id) => {
    return db.query('SELECT card_id FROM user_game_cards WHERE user_game_cards.user_id = $1 AND game_id = $2', [user_id, game_id])
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

const verifyUserHasCards = (user_id, game_id, [card1, card2, card3]) => {

    return db.query('SELECT * FROM user_game_cards WHERE user_id=$1 AND game_id=$2 AND card_id=$3', [user_id, game_id, card1])
        .then((results) => {
            if (results === undefined || results.length === 0) return false;
            else {
                return db.query('SELECT * FROM user_game_cards WHERE user_id=$1 AND game_id=$2 AND card_id=$3', [user_id, game_id, card2])
                    .then((results) => {
                        if (results === undefined || results.length === 0) return false;
                        else {
                            return db.query('SELECT * FROM user_game_cards WHERE user_id=$1 AND game_id=$2 AND card_id=$3', [user_id, game_id, card3])
                                .then((results) => {
                                    if (results === undefined || results.length === 0) return false;
                                    else return true;
                                })
                                .catch((error) => { console.log(error) })
                        }
                    })
                    .catch((error) => { console.log(error) })
            }
        })
        .catch((error) => { console.log(error) })
};

const addToPassedCardsTable = (user_id, game_id, [card1, card2, card3]) => {

    [card1, card2, card3].forEach((card) => {
        return db.none('INSERT INTO passed_cards (user_id, game_id, card_id) VALUES ($1, $2, $3)', [user_id, game_id, card])
            .catch((error) => { console.log(error) })
    })
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
    dealCards,
    initializeUserGameCards,
    getUserIDFromGame,
    getAllCardsFromGame,
    clearUserGameCards,
    deleteGamePlayer,
    getPlayerCount,
    maxPlayers,
    getGamePlayers,
    checkGameStateExists,
    getCurrentCards,
    getSharedInformation,
    joinCardsInPlay,
    verifyUserHasCards,
    addToPassedCardsTable,
    setOwnerOfCard
};