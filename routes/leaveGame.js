const express = require('express');
const router = express.Router();
const Game = require('../db/game');
const gameSocket = io.of('/game');

router.get('/', (req, res) => {
  const game_id = req.query.game_id;

  gameSocket.to(game_id).emit('GAME OVER', {game_id: game_id});
  Game.deleteGame(game_id);

});

module.exports = router;