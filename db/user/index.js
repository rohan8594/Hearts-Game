const db = require("../../db");

const createUser = (username, hash) => {
  return db.none("INSERT INTO users (username, password) VALUES ($1, $2)", [
    username,
    hash
  ]);
};

const findById = user_id => {
  return db.one("SELECT * FROM users WHERE user_id = $1", [user_id]);
};

const findByUsername = username => {
  return db.one("SELECT * FROM users WHERE username = $1", [username]);
};

module.exports = {
  createUser,
  findById,
  findByUsername
};
