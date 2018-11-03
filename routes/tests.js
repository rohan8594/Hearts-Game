const express = require("express");
const router = express.Router();
const db = require('../db');

router.get("/", (request, response) => {
    db.any(`SELECT * FROM users`)
        .then( results => response.json( results ) )
        .catch( error => {
            console.log( error )
            response.json({ error })
        })
 });

module.exports = router;