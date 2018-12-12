const express = require("express");
const router = express.Router();
const Game = require('../db/game');

/*
router.get("/", (request, response) => {
    Game.clearUserGameCards(17)
        .then(() => {
            Game.initializeUserGameCards(17)
                .then(() => {
                    Game.dealCards(17);
                    setTimeout(() => {
                        Game.getAllCardsFromGame(17)
                            .then(results => response.json(results))
                    }, 5000)
                });
        });
});
*/



router.get("/", (request, response) => {
    Game.verifyUserHasCards(2, 15, [35, 25, 17])
        .then((result) => {
            if (result === true) response.json('Test passed');
            else response.json('Test failed');
        })
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

/*
router.get("/", (request, response) => {
    db.any(`INSERT INTO test_table ("testString") VALUES ('Hello at ${Date.now()}')`)
        .then( _ => db.any(`SELECT * FROM test_table`) )
        .then( results => response.json( results ) )
        .catch( error => {
            console.log( error )
            response.json({ error })
        })
});
*/

module.exports = router;
