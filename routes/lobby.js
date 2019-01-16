const express = require("express");
const router = express.Router();
const io = require("../sockets");
const Game = require("../db/game");
const lobbySocket = io.of("/lobby");
const isAuthenticated = require("../config/passport/isAuthenticated");

router.get("/", isAuthenticated, (req, res) => {
  const { user } = req;
  const passedError = req.query.error;

  res.render("lobby", { user: user, title: "Hearts Game", error: passedError });
});

router.post("/createGame", isAuthenticated, (req, res) => {
  const { user } = req;
  const { max_players, game_name } = req.body;

  req.checkBody("game_name", "Game name cannot be empty").notEmpty();
  const errors = req.validationErrors();

  if (errors) {
    const errStr = encodeURIComponent(errors[0].msg);
    res.redirect("/lobby?error=" + errStr);
  } else {
    Game.createGame(max_players, user.user_id, game_name)
      .then(results => {
        const { game_id } = results[0];
        Game.createInitialGamePlayer(user.user_id, game_id)
          .then(() => {
            Game.joinCardsInPlay(user.user_id, game_id);

            lobbySocket.emit("GET GAMES");
            res.redirect(`/game/${game_id}`);
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
      });
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.post("/joinGame", isAuthenticated, (req, res) => {
  const { user } = req;
  const { join_btn: game_id } = req.body;

  Game.verifyInGame(user.user_id, game_id).then(in_game => {
    if (in_game === "0") {
      Game.joinGame(user.user_id, game_id);
      Game.joinCardsInPlay(user.user_id, game_id);

      lobbySocket.emit("GET GAMES");
      res.redirect(`/game/${game_id}`);
    } else {
      const errStr = encodeURIComponent("You are already in this game!");
      res.redirect("/lobby?error=" + errStr);
    }
  });
});

router.post("/rejoinGame", isAuthenticated, (req, res) => {
  const { user } = req;
  const { rejoin_btn: game_id } = req.body;

  res.redirect(`/game/${game_id}`);
});

router.post("/observeGame", isAuthenticated, (req, res) => {
  const { user } = req;
  const { watch_btn: game_id } = req.body;

  Game.verifyInGame(user.user_id, game_id).then(in_game => {
    if (in_game === "0") {
      Game.observeGame(user.user_id, game_id);
      res.redirect(`/game/${game_id}`);
    } else {
      const errStr = encodeURIComponent("You are already in this game!");
      res.redirect("/lobby?error=" + errStr);
    }
  });
});

router.get("/rules", (req, res) => {
  res.render("rules");
});

// Lobby sockets
const displayGameList = (user_id, socket) => {
  if (socket != undefined) {
    Game.getCurrentGames().then(currentGames => {
      for (let index = 0; index < currentGames.length; index++) {
        Game.verifyInGame(user_id, currentGames[index].game_id).then(
          results => {
            currentGames[index]["is_my_game"] = results;
          }
        );
      }

      setTimeout(() => {
        socket.emit("DISPLAY GAMES LIST", currentGames);
      }, 200);
    });
  }
};

lobbySocket.on("connection", socket => {
  lobbySocket.emit("GET GAMES");

  socket.on("GAME LIST", data => {
    const { user_id } = data;
    displayGameList(user_id, socket);
  });
});

module.exports = router;
