const db = require('../db');

const createGame = (max_players, user_id, game_name) => {
  return db.query('INSERT INTO games (max_players, game_name, round_number) VALUES ' +
    '($1, $2, $3) RETURNING game_id', [max_players, game_name, 1])
    .catch((error) => { console.log(error) })
};

const createInitialGamePlayer = (user_id, game_id) => {
  return db.none('INSERT INTO game_players (user_id, game_id, total_score, current_round_score, turn_sequence) VALUES ' +
    '($1, $2, $3, $4, $5)', [user_id, game_id, 0, 0, 1])
    .catch((error) => { console.log(error) })
};

const getCurrentGames = () => {
  return db.query('SELECT g.game_id, game_name, max_players, COUNT(*) as player_count ' +
    'FROM games g, game_players gp ' +
    'WHERE g.game_id=gp.game_id ' +
    'GROUP BY g.game_id ')
    .catch((error) => { console.log(error) })
};

const getPlayerCount = (game_id) => {
  return db.query('SELECT COUNT(*) as player_count ' +
    'FROM game_players ' +
    'WHERE game_id=$1', [game_id])
    .then((results) => { return results[0].player_count })
    .catch((error) => { console.log(error) })
};

const observeGame = (user_id, game_id) => {
  return db.none('INSERT into game_observers(user_id, game_id) ' +
    'VALUES ($1, $2)', [user_id, game_id])
    .catch((error) => { console.log(error) })
};

const joinGame =  (user_id, game_id) => {
  getPlayerCount(game_id)
    .then((player_count) => {
      return db.none('INSERT into game_players (user_id, game_id, total_score, current_round_score, turn_sequence) ' +
        'VALUES ($1, $2, $3, $4, $5)', [user_id, game_id, 0, 0, (parseInt(player_count) + 1)])
        .catch((error) => { console.log(error) })
    })
};

const deleteGame = (game_id) => {
  return db.none(
    'DELETE FROM cards_in_play WHERE game_id = $1; ' +
    'DELETE FROM passed_cards WHERE game_id = $1; ' +
    'DELETE FROM user_game_cards WHERE game_id = $1; ' +
    'DELETE FROM game_observers WHERE game_id = $1; ' +
    'DELETE FROM game_players WHERE game_id = $1; ' +
    'DELETE FROM games WHERE game_id = $1;', [game_id])
    .catch((error) => { console.log(error) })
};

const deleteGamePlayer = (user_id, game_id) => {
  return db.none('DELETE FROM game_players WHERE user_id=$1 AND game_id=$2', [user_id, game_id])
    .catch((error) => { console.log(error) })
};

const verifyInGame = (user_id, game_id) => {
  return db.query('SELECT MAX(count) as in_Game ' +
    'FROM ( ' +
    'SELECT COUNT(*) FROM game_players WHERE game_players.user_id = $1 AND game_players.game_id = $2 ' +
    'UNION ' +
    'SELECT COUNT(*) FROM game_observers WHERE game_observers.user_id = $1 AND game_observers.game_id = $2 ' +
    ') as counts' , [user_id, game_id])
    .then((results) => { return results[0].in_game })
    .catch((error) => { console.log(error) })
};

const maxPlayers = (game_id) => {
  return db.query('SELECT max_players FROM games WHERE game_id = $1', [game_id])
    .catch((error) => { console.log(error) })
};

const clearUserGameCards = (game_id) => {
  return db.none('DELETE FROM user_game_cards WHERE game_id = $1', [game_id])
    .catch((error) => { console.log(error) })
};

const initializeUserGameCards = (game_id) => {
  return db.none(
    'DO $$ ' +
    'BEGIN ' +
    'FOR counter IN 1..52 LOOP ' +
    'INSERT INTO user_game_cards (game_id, card_id) ' +
    'VALUES ($1, counter); ' +
    'END LOOP; ' +
    'END; $$ ', [game_id] )
    .catch((error) => { console.log(error) })
};

const getUserNamesFromGame = (game_id) => {
  return db.query('SELECT username, turn_sequence ' +
    'FROM users, game_players ' +
    'WHERE users.user_id = game_players.user_id AND game_players.game_id = $1 ' +
    'ORDER BY turn_sequence ', [game_id])
    .catch((error) => { console.log(error) })
};

const getAllCardsFromGame = (game_id) => {
  return db.query('SELECT * from user_game_cards WHERE game_id = $1', [game_id])
    .catch((error) => { console.log(error) })
};

const dealCards = (game_id) => {
  const player_array = [];
  getUserIDSortedByTurnSequence(game_id)
    .then((results) => {
      let number_players = results.length;
      for (index = 0; index < results.length; index++) {
        player_array.push(results[index].user_id);
      }
      getAllCardsFromGame(game_id)
        .then((results) => {
          let index;
          const cardsLeft = [];

          for (index = 0; index < results.length; index++) {
            cardsLeft.push(results[index].card_id);
          }

          for (index = 0; index < results.length; index++) {
            let randomValue = Math.floor(Math.random() * cardsLeft.length);
            let card_assigned = cardsLeft[randomValue];
            cardsLeft.splice(randomValue, 1);
            setOwnerOfCard(card_assigned, player_array[index % number_players], game_id)
          }
        })
    })
};

const setOwnerOfCard = (card_id, user_id, game_id) => {
  return db.none('UPDATE user_game_cards ' +
    'SET user_id = $1 ' +
    'WHERE card_id = $2 AND game_id = $3', [user_id, card_id, game_id])
    .catch((error) => { console.log(error) })
};

const checkGameStateExists = (game_id) => {
  return db.query('SELECT * FROM user_game_cards WHERE game_id=$1', [game_id])
    .then((results) => {
      return !(results === undefined || results.length === 0);
    })
    .catch((error) => { console.log(error) })
};

const getCardCount = (user_id, game_id) => {
  return db.query('SELECT COUNT(card_id) FROM user_game_cards WHERE user_id = $1 AND game_id = $2 AND in_play = \'0\' ', [user_id, game_id])
    .catch((error) => { console.log(error) })
};

const getUserIDSortedByTurnSequence = (game_id) => {
  return db.query('SELECT * FROM game_players WHERE game_id = $1 ORDER BY turn_sequence', [game_id])
    .catch((error) => { console.log(error) })
};

const getSharedInformation = (game_id) => {
  return db.query(
    'SELECT  username, turn_sequence, ' +
    'current_round_score, total_score, ' +
    'cards_in_play.card_id AS card_in_play, 0 AS card_count ' +
    'FROM users, game_players, cards_in_play ' +
    'WHERE users.user_id = game_players.user_id ' +
    'AND cards_in_play.game_id = $1 ' +
    'AND cards_in_play.user_id = users.user_id ' +
    'AND game_players.game_id = $1 ' +
    'GROUP BY username, turn_sequence, current_round_score, total_score, cards_in_play.card_id ' +
    'ORDER BY turn_sequence', [game_id]
  )
}

const getHandSize = (username, game_id) => {
  return db.one(
    'SELECT count(DISTINCT user_game_cards.card_id) AS card_count ' +
    'FROM users, user_game_cards ' + 
    'WHERE users.username = $1 ' +
    'AND users.user_id = user_game_cards.user_id ' +
    'AND user_game_cards.game_id = $2 ', [username, game_id]
  )
}
const joinCardsInPlay = (user_id, game_id) => {
  return db.none(
    'INSERT INTO cards_in_play (user_id, game_id) ' +
    'VALUES ($1, $2)', [user_id, game_id])
    .catch((error) => { console.log(error) })

};

const getCurrentCards = ( game_id, user_id ) => {
  return db.query('SELECT card_id FROM user_game_cards WHERE user_id = $1', [user_id])
    .catch((error) => { console.log(error) })
};

const getUserIDFromGame = (game_id) => {
  return db.query('SELECT user_id FROM game_players WHERE game_players.game_id = $1', [game_id])
    .catch((error) => { console.log(error) })
};

const getUsernameFromID = (username) => {
  return db.query('SELECT username FROM users WHERE username = $1', [username])
    .catch((error) => { console.log(error) })
};

const getGamePlayers = (game_id) => {
  return db.query('SELECT * FROM game_players WHERE game_id = $1 ORDER BY turn_sequence', [game_id])
    .catch((error) => { console.log(error) })
};

const getNameFromID = (user_id) => {
  return db.query('SELECT username FROM users WHERE user_id = $1', [user_id])
};

const getPlayerCards = (user_id, game_id) => {
  return db.query('SELECT card_id FROM user_game_cards WHERE user_game_cards.user_id = $1 AND game_id = $2 ORDER BY card_id', [user_id, game_id])
    .catch((error) => { console.log(error) })
};

const getCurrentTurn = (game_id) => {
  return db.query('SELECT users.username AS current_player FROM games, users WHERE game_id = $1 AND current_player = users.user_id', [game_id])
    .then((results) => {
      if(results.length == 0 ) { return Promise.resolve({ current_player : null }) }
      else {return results}
    })
    .catch((error) => { console.log(error) })
};

const getCurrentTurnId = (game_id) => {
  return db.query('SELECT current_player FROM games WHERE game_id = $1', [game_id])
    .catch((error) => { console.log(error) })
};

const getPlayerTotalScore = (user_id, game_id) => {
  return db.query('SELECT total_score FROM game_players WHERE game_players.user_id = $1 AND game_id = $2', [user_id, game_id])
    .catch((error) => { console.log(error) })
};

const getPlayerRoundScore = (user_id, game_id) => {
  return db.query('SELECT current_round_score FROM game_players WHERE game_players.user_id = $1 AND game_id = $2', [user_id, game_id])
    .catch((error) => { console.log(error) })
};

const retrieveOwnedCard = (user_id, game_id, card_id) => {
  return db.one('SELECT card_id FROM user_game_cards WHERE card_id = $1 AND user_id = $2 AND game_id = $3', [card_id, user_id, game_id])
    .catch((error) => { console.log(error) })
};

const verifyUserHasCards = (user_id, game_id, [card1, card2, card3]) => {

  return db.query('SELECT * FROM user_game_cards WHERE user_id=$1 AND game_id=$2 AND card_id=$3', [user_id, game_id, card1])
    .then((results) => {
      if (results === undefined || results.length === 0) return false;
      else {
        return db.query('SELECT * FROM user_game_cards WHERE user_id=$1 AND game_id=$2 AND card_id=$3', [user_id, game_id, card2])
          .then((results) => {
            if (results === undefined || results.length === 0) return false;
            else {
              return db.query('SELECT * FROM user_game_cards WHERE user_id=$1 AND game_id=$2 AND card_id=$3', [user_id, game_id, card3])
                .then((results) => {
                  if (results === undefined || results.length === 0) return false;
                  else return true;
                })
                .catch((error) => { console.log(error) })
            }
          })
          .catch((error) => { console.log(error) })
      }
    })
    .catch((error) => { console.log(error) })
};

const addToPassedCardsTable = (user_id, game_id, [card1, card2, card3]) => {

  [card1, card2, card3].forEach((card) => {
    return db.none('INSERT INTO passed_cards (user_id, game_id, card_id) VALUES ($1, $2, $3)', [user_id, game_id, card])
      .catch((error) => { console.log(error) })
  })
};

const checkAllPlayersPassed = (game_id) => {
  return maxPlayers(game_id)
    .then((results) => {
      const max_players = results[0].max_players;

      return db.query('SELECT COUNT(DISTINCT card_id) FROM passed_cards WHERE game_id = $1', [game_id])
        .then((results) => {
          return results[0].count == max_players * 3;
        })
    })
};

const getCurrentRoundNumber = (game_id) => {
  return db.query('SELECT round_number FROM games WHERE game_id=$1', [game_id])
    .catch((error) => { console.log(error) })
};

const getPassCardsForUser = (user_id, game_id) => {
  return db.query('SELECT * FROM passed_cards WHERE user_id=$1 AND game_id=$2', [user_id, game_id])
    .catch((error) => { console.log(error) })
};

const deletePassCard = (card_id, game_id) => {
  return db.none('DELETE FROM passed_cards WHERE card_id=$1 AND game_id=$2', [card_id, game_id])
    .catch((error) => { console.log(error) })
};

const setCurrentPlayer = (user_id, game_id) => {
  return db.none('UPDATE games SET current_player=$1 WHERE game_id=$2', [user_id, game_id])
    .catch((error) => { console.log(error) })
};

const getStartingPlayer = (game_id) => {
  return db.query('SELECT user_id FROM user_game_cards WHERE game_id=$1 AND card_id=$2', [game_id, 2])
    .catch((error) => { console.log(error) })
};

const verifyUserPassedCards = (user_id, game_id) => {
  return getPassCardsForUser(user_id, game_id)
    .then((results) => {
      return !(results === undefined || results.length === 0);
    })
    .catch((error) => { console.log(error) })
};

const addPlayedCard = (user_id, game_id, card_id) => {
  return db.none('UPDATE cards_in_play SET card_id = $1 WHERE user_id = $2 AND game_id = $3', [card_id, user_id, game_id])
    .then(() => {
      return setOwnerOfCard(card_id, null, game_id);
    })
    .catch((error) => { console.log(error) })
};

const getTurnSequenceForPlayer = (user_id, game_id) => {
  return db.query('SELECT turn_sequence FROM game_players WHERE user_id = $1 AND game_id = $2', [user_id, game_id])
    .catch((error) => { console.log(error) })
};

const getCardsLeft = (game_id) => {
  return db.query('SELECT COUNT(DISTINCT card_id) AS cards_left FROM user_game_cards WHERE game_id = $1 AND user_id <> 0', [game_id])
    .catch((error) => { console.log(error) })
};

const getCardsInPlay = (game_id) => {
  return db.query('SELECT * from cards_in_play WHERE game_id = $1', [game_id])
    .catch((error) => { console.log(error) })
};

//0 Club
//1 Diamond
//2 Heart
//3 Spade
const checkPlayerTakingCards = (game_id) => {
  //get cards
  return getCardsInPlay(game_id)
    .then((cardsInPlay) => {
      return getLeadingSuit(game_id)
        .then((results) => {
          let lead_suit = results[0].leading_suit;

          let value;
          let max_value = 0;
          let player_taking_hand;
          let points_on_table = 0;

          for(let index = 0; index < cardsInPlay.length; index++ ) {
            let current_card = cardsInPlay[index].card_id;
            let current_suite =  Math.floor(((current_card) - 1) / 13);

            if((current_card - 1) % 13 == 0) { value = 14 }
            else { value = (current_card - 1) % 13 + 1 }

            if(current_suite == 3 && value == 12) { points_on_table += 13 }
            else if (current_suite == 2) { points_on_table += 1 }

            if(current_suite == lead_suit) {
              if(value > max_value) {
                max_value = value;
                player_taking_hand = cardsInPlay[index].user_id;
              }
            }
          }
          return Promise.resolve([{ player_taking_hand : player_taking_hand, points_on_table : points_on_table }]);
        });
    })
};

const allocatePointsForTurn = (game_id) => {
  return checkPlayerTakingCards(game_id)
    .then((results) => {
      let points_on_table = results[0].points_on_table;
      let player_taking_hand = results[0].player_taking_hand;
      return givePointsToPlayer(game_id, player_taking_hand, points_on_table)
        .then(() => {
          return db.none('UPDATE cards_in_play SET card_id = null WHERE game_id = $1', [game_id])
            .then (() => {
              return setLeadingSuit(game_id, null)
                .then(() => {
                  return Promise.resolve(player_taking_hand);
                })
            })
        })
    })
};

const givePointsToPlayer = (game_id, user_id, points) => {
  return db.none('UPDATE game_players SET current_round_score = current_round_score + $1 WHERE game_id = $2 AND user_id = $3', [points, game_id, user_id])
    .catch((error) => { console.log(error) })
};

const getCardsInPlayCount = (game_id) => {
  return db.query('SELECT COUNT(card_id) FROM cards_in_play WHERE card_id <> 0 AND game_id = $1', [game_id])
    .catch((error) => { console.log(error) })
};

const getLeadingSuit = (game_id) => {
  return db.query('SELECT leading_suit FROM games WHERE game_id = $1', [game_id])
    .catch((error) => { console.log(error) })
};

const setLeadingSuit = (game_id, lead_suit) => {
  return db.none('UPDATE games SET leading_suit = $1 WHERE game_id = $2', [lead_suit, game_id])
    .catch((error) => { console.log(error) })
};

const updateTotalScores = (game_id) => {
  return db.none('UPDATE game_players SET total_score = total_score + current_round_score WHERE game_id = $1', [game_id])
    .catch((error) => { console.log(error) })
};

const incrementRoundNumber = (game_id) => {
  return db.none('UPDATE games SET round_number = round_number + 1 WHERE game_id = $1', [game_id])
    .catch((error) => { console.log(error) })
};

const getUserId = (user_name) => {
  return db.one('SELECT user_id FROM users WHERE username = $1', [user_name])
    .catch((error) => { console.log(error) })
};

const nudgePassPhase = (game_id) => {
  return db.none('UPDATE game_players ' +
    'SET total_score = total_score + 100 ' +
    'WHERE game_id = $1 ' +
    'AND user_id ' +
    'NOT IN' +
    '(SELECT user_id FROM passed_cards ' +
    'WHERE game_id = $1)', [game_id])
};

const giveTotalPointsToPlayer = (game_id, user_id, points) => {
  return db.none('UPDATE game_players SET total_score = total_score + $1 WHERE game_id = $2 AND user_id = $3', [points, game_id, user_id])
    .catch((error) => {console.log(error)})
};

const getMaximumScore = (game_id) => {
  return db.query('SELECT MAX(total_score) AS maximum_score ' +
  'FROM game_players ' +
  'WHERE game_id = $1', [game_id])
}

module.exports = {
  createGame,
  createInitialGamePlayer,
  getCurrentGames,
  observeGame,
  joinGame,
  deleteGame,
  verifyInGame,
  getPlayerCards,
  getCardCount,
  getPlayerTotalScore,
  getPlayerRoundScore,
  getUserNamesFromGame,
  dealCards,
  initializeUserGameCards,
  getUserIDFromGame,
  getAllCardsFromGame,
  clearUserGameCards,
  deleteGamePlayer,
  getPlayerCount,
  maxPlayers,
  getGamePlayers,
  checkGameStateExists,
  getCurrentCards,
  getSharedInformation,
  joinCardsInPlay,
  getCurrentTurn,
  setOwnerOfCard,
  getCurrentTurnId,
  retrieveOwnedCard,
  verifyUserHasCards,
  addToPassedCardsTable,
  checkAllPlayersPassed,
  getCurrentRoundNumber,
  getPassCardsForUser,
  deletePassCard,
  setCurrentPlayer,
  getStartingPlayer,
  addPlayedCard,
  getTurnSequenceForPlayer,
  getCardsLeft,
  checkPlayerTakingCards,
  allocatePointsForTurn,
  verifyUserPassedCards,
  getCardsInPlay,
  getCardsInPlayCount,
  getLeadingSuit,
  setLeadingSuit,
  updateTotalScores,
  incrementRoundNumber,
  getUserId,
  nudgePassPhase,
  givePointsToPlayer,
  giveTotalPointsToPlayer,
  getHandSize,
  getMaximumScore
};