const express = require('express');
const router = express.Router();
const Game = require('../db/game');
const gameSocket = io.of('/game');
const { update } = require('./game');

router.get('/', (req, res) => {
  const { user } = req;
  const game_id = req.query.game_id;

  Game.isGamePlayer(user.user_id, game_id)
    .then((game_player) => {
      if (game_player === undefined || game_player.length === 0) {
        res.redirect('/lobby');
      } else {
        res.redirect('/lobby');
        Game.giveTotalPointsToPlayer(game_id, user.user_id, 100)
          .then(() => {
            update(game_id);
            setTimeout(() => {
              gameSocket.to(game_id).emit('GAME OVER', {game_id: game_id});
              Game.deleteGame(game_id);
            }, 500);
          })
      }
    })
});

module.exports = router;