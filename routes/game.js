const express = require('express');
const router = express.Router();
const isAuthenticated = require('../config/passport/isAuthenticated');
const io = require('../sockets');
const gameSocket = io.of('/game');
const Game = require('../db/game');

let user;
let game_id;

router.get('/', isAuthenticated, (req, res, next) => {
  res.render('game', { title: 'Hearts Game' });
});

router.get('/:game_id', isAuthenticated, (req, res) => {
  user = req.user;
  game_id = req.params.game_id;
  Game.checkGameExists(game_id)
    .then((results) => {
      if(results.length > 0) {
        res.render('game', { user: user, game_id: game_id });
      } else{
        res.redirect('index');
      }
});


gameSocket.on('connection', (socket) => {

  if (game_id == null) {
    return;
  }

  socket.join(game_id);

  checkGameReady(game_id)
    .then((results) => {
      if (results === true) {
        return prepareCards(game_id)
          .then(() => {
            return Game.getUserNamesFromGame(game_id)
              .then((username) => {
                gameSocket.to(game_id).emit('LOAD PLAYERS', { game_players : username });

                setTimeout(() => {
                  return update(game_id);
                }, 500)
              })
          })
      } else {
        return Game.getUserNamesFromGame(game_id)
          .then((username) => {
            gameSocket.to(game_id).emit('LOAD PLAYERS', { game_players : username});

            setTimeout(() => {
              return update(game_id);
            }, 500)
          })
      }
    });

  // game events
  socket.on('GET PLAYER HAND', (data) => {
    const { user_id, game_id } = data;

    Game.getPlayerCards(user_id, game_id)
      .then((player_hand) => {
        socket.emit('SEND PLAYER HAND', { player_hand: player_hand } );
      })
  });

  socket.on('NUDGE TIMER OVER', (data) => {
    const game_id = data.game_id;
    const nudged_player = data.nudged_player;

    Game.getCurrentTurn(game_id)
      .then((current_player) => {
        if(current_player[0] == null){
          if (nudged_player == null) {
            Game.nudgePassPhase(game_id)
              .then(() =>{
                update(game_id)
                  .then(() => {
                    gameSocket.to(game_id).emit('GAME OVER', {game_id: game_id})
                    Game.deleteGame(game_id);
                  })
              })
          }
        }
        else{
          if (current_player[0].current_player == nudged_player) {
            Game.getUserId(nudged_player)
              .then((current_player_id) => {
                Game.giveTotalPointsToPlayer(game_id, current_player_id.user_id, 100)
                  .then(() =>{
                    update(game_id)
                      .then(() => {
                        gameSocket.to(game_id).emit('GAME OVER', {game_id: game_id})
                        Game.deleteGame(game_id);
                      })
                  })
              })
          }
        }
      })
  });

  socket.on('PASS CARDS', (data) => {
    const { user_id, game_id, passed_cards } = data;

    let card1 = parseInt(passed_cards[0]),
      card2 = parseInt(passed_cards[1]),
      card3 = parseInt(passed_cards[2]);

    Game.verifyUserHasCards(user_id, game_id, [card1, card2, card3])
      .then((hasCards) => {
        if (hasCards === true) {
          Game.verifyUserPassedCards(user_id, game_id)
            .then((hasPassed) => {
              if (hasPassed === false) {
                Game.addToPassedCardsTable(user_id, game_id, [card1, card2, card3]);

                setTimeout(() => {
                  [card1, card2, card3].forEach((card) => {
                    Game.setOwnerOfCard(card, null, game_id);
                  });

                  socket.emit('VALID PASS');

                  setTimeout(() => {
                    Game.checkAllPlayersPassed(game_id)
                      .then((cardsPassed) => {
                        if (cardsPassed === true) {
                          changeCardsOwnership(game_id);
                        } else {
                          // notify player to wait for others to pass
                        }
                      })
                  }, 100)
                }, 100)
              } else {
                console.log('You already passed.')
              }
            });
        } else {
          // notify user that either he doesn't have these cards or they are already passed
        }
      })
  });

  socket.on('PLAY CARDS', (data) => {
    let { user_id, game_id, passed_card: card_played } = data;
    card_played = parseInt(card_played);

    Game.getGamePlayers(game_id)
      .then((gamePlayers) => {
        Game.getTurnSequenceForPlayer(user_id, game_id)
          .then((turnQuery) => {
            let turnSequence = turnQuery[0].turn_sequence;

            Game.getCurrentTurnId(game_id)
              .then((results) => {
                if (results[0].current_player != user_id) return;
                Game.retrieveOwnedCard(user_id, game_id, card_played).then((results) => {
                  if (results.length === 0) return;
                  Game.getLeadingSuit(game_id)
                    .then((results) => {
                      let lead_suit = results[0].leading_suit;

                      if (lead_suit == null) {
                        Game.setLeadingSuit(game_id, Math.floor(((card_played) - 1) / 13))
                      }
                    });

                  setTimeout(() => {
                    Game.addPlayedCard(user_id, game_id, card_played)
                      .then(() => {
                        update(game_id)
                          .then(() => {
                            Game.getCardsInPlayCount(game_id)
                              .then((results) => {
                                let numberOfPlayedCards = results[0].count;

                                if (numberOfPlayedCards == gamePlayers.length) {
                                  Game.allocatePointsForTurn(game_id)
                                    .then((winning_player) => {
                                      Game.getCardsLeft(game_id).then((results) => {
                                        let cardsLeft = results[0].cards_left;

                                        if (cardsLeft == 0) {
                                          // Display Winner of round
                                          // Big delay and then deal cards again for next round
                                          Game.updateTotalScores(game_id)
                                            .then(() => {
                                              Game.getMaximumScore(game_id)
                                                .then((results) => {
                                                  let maximumScore = results[0].maximum_score;
                                                  if( maximumScore >= 100 ){
                                                    gameSocket.to(game_id).emit('GAME OVER', {game_id: game_id})
                                                    Game.deleteGame(game_id);
                                                  } else{
                                                    Game.incrementRoundNumber(game_id)
                                                      .then(() => {
                                                        Game.setCurrentPlayer(null, game_id)
                                                          .then(() => {
                                                            setTimeout(() => {
                                                              Game.dealCards(game_id);
                                                              setTimeout(() => {
                                                                Game.getUserNamesFromGame(game_id)
                                                                  .then((game_players) => {
                                                                    gameSocket.to(game_id).emit('LOAD PLAYERS', { game_players : game_players });
                                                                    setTimeout(() => {
                                                                      update(game_id)
                                                                    }, 500)
                                                                  })
                                                              }, 500)
                                                            }, 2000)
                                                          });
                                                      })
                                                  }
                                                })
                                              
                                            });
                                        } else {
                                          Game.setCurrentPlayer(winning_player, game_id)
                                            .then(() => {
                                              setTimeout(() => {
                                                return update(game_id);
                                              }, 2000)
                                            })
                                        }
                                      })
                                    })
                                } else {
                                  let next_player = turnSequence % gamePlayers.length;

                                  Game.setCurrentPlayer(gamePlayers[next_player].user_id, game_id)
                                    .then(() => {
                                      setTimeout(() => {
                                        return update(game_id);
                                      }, 2000)
                                    })

                                }
                              })

                          })

                      })
                  }, 100);

                });
              })

          })

      })

  });
});

// game logic related functions
const checkGameReady = (game_id) => {
  return Game.checkGameStateExists(game_id)
    .then((exists) => {
      if (exists === false) {
        return Game.maxPlayers(game_id)
          .then((results) => {
            const max_players = results[0].max_players;

            return Game.getPlayerCount(game_id)
              .then((player_count) => {
                // check if game room is full to start game
                return Promise.resolve(player_count == max_players);
              })
          })
          .catch((error) => { console.log(error) });
      }
    })
};

const prepareCards = (game_id) => {
  return Game.initializeUserGameCards(game_id)
    .then(() => {
      Game.dealCards(game_id);
      return Promise.resolve(game_id);
    })
};

const update = (game_id) => {
  return Game.getSharedInformation(game_id)
    .then((shared_player_information) => {
      for (let index = 0; index < shared_player_information.length; index++){
        Game.getHandSize(shared_player_information[index].username, game_id)
          .then((results) => {
            shared_player_information[index]['card_count'] = results.card_count;
          })
      }
      setTimeout(() => {
      return Game.getCurrentTurn(game_id)
        .then((turn_information) => {
          gameSocket.to(game_id).emit('UPDATE', { shared_player_information : shared_player_information, turn_information : turn_information });
          return Promise.resolve(shared_player_information);
        })
      }, 100);
    })
};

const changeCardsOwnership = (game_id) => {
  Game.getGamePlayers(game_id)
    .then((game_players) => {
      Game.getCurrentRoundNumber(game_id)
        .then((result) => {
          const round_number = result[0].round_number;

          if (round_number % 4 === 1) {
            // pass to left
            for (let i = 0; i < game_players.length; i++) {
              let { user_id: owner } = game_players[i];
              let { user_id: player_to_send } = game_players[(i + 1) % game_players.length];

              passCard(owner, game_id, player_to_send);
            }
          } else if (round_number % 4 === 2) {
            // pass to right
            for (let i = 0; i < game_players.length; i++) {
              let { user_id: owner } = game_players[i];
              let { user_id: player_to_send } = game_players[(i - 1) % game_players.length];

              passCard(owner, game_id, player_to_send);
            }
          } else if (round_number % 4 === 3) {
            // pass across
            for (let i = 0; i < game_players.length; i++) {
              let { user_id: owner } = game_players[i];
              let { user_id: player_to_send } = game_players[(i + (game_players.length) / 2) % game_players.length];

              passCard(owner, game_id, player_to_send);
            }
          }
          startGame(game_id);
        })
    })

};

const passCard = (owner, game_id, player_to_send) => {
  Game.getPassCardsForUser(owner, game_id)
    .then((cards) => {
      for (let j = 0; j < cards.length; j++) {
        let card = cards[j].card_id;

        Game.setOwnerOfCard(card, player_to_send, game_id)
          .then(() => {
            Game.deletePassCard(card, game_id)
          })
      }
    })
};

const startGame = (game_id) => {
  setTimeout(() => {
    Game.getStartingPlayer(game_id)
      .then((results) => {
        const starting_player = results[0].user_id;

        Game.setCurrentPlayer(starting_player, game_id)
          .then(() => {
            return update(game_id);
          })
      })
  }, 500)
};

module.exports = router;