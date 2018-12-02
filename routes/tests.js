const express = require("express");
const router = express.Router();
const db = require('../db');

const Game = require('../db/game');




router.get("/", (request, response) => {
    Game.clearUserGameCards(13);
    Game.initializeUserGameCards(13);
    Game.dealCards(13, 2);
    Game.getAllCardsFromGame(13)
    .then(results=> response.json(results))
    /*
        .then(db.any('SELECT * FROM user_game_cards'))
        .then( results=> response.json(results))
        .catch(error => {
            console.log(error)
            response.json({error})
        })*/
})
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


/*

//initializeUserGameCards
//dealCards


*/