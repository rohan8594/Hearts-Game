const express = require('express');
const router = express.Router();
const Game = require('../db/game');

router.get('/', (req, res) => {
    const { user } = req;
    const game_id = req.query.game_id;

    // gameSocket.to(game_id).emit('Left game', { user: user, game_id: game_id });
    Game.deleteGamePlayer(user.user_id, game_id);
    Game.getPlayerCount(game_id)
        .then((player_count) => {
            if (player_count < 1) {
                Game.deleteGame(game_id)
            }
        });
    res.redirect('/lobby');
});

module.exports = router;