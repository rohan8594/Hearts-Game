const db = require('../db');

const createGame = (game_id, max_players, user_id) => {
    return db.none('INSERT INTO games (game_id, max_players, current_player) VALUES ($1, $2, $3)', [game_id, max_players, user_id])
};

const createInitialGamePlayer = (user_id, game_id) => {
    return db.none('INSERT INTO game_players (user_id, game_id, total_score, current_round_score, turn_sequence) VALUES ' +
        '($1, $2, $3, $4, $5)', [user_id, game_id, 0, 0, 1])
};

module.exports = {
    createGame,
    createInitialGamePlayer
};