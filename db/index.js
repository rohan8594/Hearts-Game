const pgp = require("pg-promise")();
require('dotenv').config();
const connection = pgp(process.env.DATABASE_URL);

module.exports = connection;