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
    'FROM games g, game_players gp WHERE g.game_id=gp.game_id GROUP BY g.game_id ')
        .catch((error) => { console.log(error) })
};

const getPlayerCount = (game_id) => {
    return db.query('SELECT COUNT(*) as player_count ' +
        'FROM game_players ' +
        'WHERE game_id=$1', [game_id])
        .then((results) => { return results[0].player_count }) 
    .catch((error) => { console.log(error) })
}

const observeGame = (user_id, game_id) => {
    return db.none('INSERT into game_observers(user_id, game_id' +
        'VALUES ($1, $2)', [user_id, game_id])
    .catch((error) => { console.log(error) })
}

const joinGame =  (user_id, game_id) => {
    getPlayerCount(game_id)
        .then((player_count) => {
            return db.none('INSERT into game_players (user_id, game_id, total_score, current_round_score, turn_sequence) ' +
                'VALUES ($1, $2, $3, $4, $5)', [user_id, game_id, 0, 0, player_count + 1])
            .catch((error) => { console.log(error) })
        })
}

const deleteGame = (game_id) => {
    return db.none('DELETE FROM games WHERE game_id=$1'), [game_id]
    .catch((error) => {console.log(error) })
}

module.exports = {
    createGame,
    createInitialGamePlayer,
    getCurrentGames,
    observeGame,
    joinGame
};