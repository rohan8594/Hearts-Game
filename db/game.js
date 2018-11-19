const db = require('../db');

const createGame = (max_players, user_id, game_name) => {
    return db.query('INSERT INTO games (max_players, current_player, game_name) VALUES ' +
    '($1, $2, $3) RETURNING game_id', [max_players, user_id, game_name])
};

const createInitialGamePlayer = (user_id, game_id) => {
    return db.none('INSERT INTO game_players (user_id, game_id, total_score, current_round_score, turn_sequence) VALUES ' +
        '($1, $2, $3, $4, $5)', [user_id, game_id, 0, 0, 1])
};

const getCurrentGames = () => {
    return db.query('SELECT g.game_id, game_name, max_players, COUNT(*) as player_count ' +
    'FROM games g, game_players gp WHERE g.game_id=gp.game_id GROUP BY g.game_id ')
        .catch((error) => { console.log(error) })
};

module.exports = {
    createGame,
    createInitialGamePlayer,
    getCurrentGames
};