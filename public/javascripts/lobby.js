const lobbySocket = io('/lobby');

lobbySocket.on('GET GAMES', () => {
  lobbySocket.emit('GAME LIST', { user_id: user_id });
});

lobbySocket.on('DISPLAY GAMES LIST', (currentGames) => {
  let games_list_div = document.getElementsByClassName('games-list-box')[0];
  let games_list_html = '';

  for (let i = 0; i < currentGames.length; i++) {
    const { game_id, game_name, max_players, player_count, is_my_game } = currentGames[i];
    games_list_html += "<div><div class='games-list-left'><label>" + game_name + "</label></div>" +
      "<div class='games-list-right'><label>" + player_count + "/" + max_players + "</label></div> ";
    if (is_my_game == 1) {
      games_list_html += "<div class='games-list-right'><form action='/lobby/rejoinGame' method='POST'><button class='btn btn-primary' name='rejoin_btn' value=" + game_id + " type='submit'>Rejoin</button></form></div>"
    } else {
      if (player_count < max_players){
        games_list_html += "<div class='games-list-right'><form action='/lobby/joinGame' method='POST'><button class='btn btn-primary' name='join_btn' value=" + game_id + " type='submit'>Join</button></form></div>"
      }
      games_list_html+= "<div class='games-list-right'><form action='/lobby/observeGame' method='POST'><button class='btn btn-primary' name='watch_btn' value=" + game_id + " type='submit'>Watch</button></form></div></div>" 
    }
  }
  games_list_div.innerHTML = games_list_html;
});
