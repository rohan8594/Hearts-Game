const express = require("express");
const router = express.Router();
const Game = require("../db/game");

router.get("/", (request, response) => {
  Game.updateTotalScores(25).then(() => {
    return response.json("Worked");
  });
});

/*
router.get("/", (request, response) => {
    Game.clearUserGameCards(13)
        .then(() => {
            Game.initializeUserGameCards(13)
                .then(() => {
                    Game.dealCards(13, 2, [2, 3]);
                    setTimeout(() => {
                        Game.getAllCardsFromGame(13)
                            .then(results => response.json(results))
                    }, 5000)
                });
        });
});
*/

module.exports = router;
