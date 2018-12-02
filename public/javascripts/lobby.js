const lobbySocket = io('/lobby');

lobbySocket.on('display games list', (currentGames) => {
    let games_list_div = document.getElementsByClassName('games-list-box')[0];
    let games_list_html = '';

    for (let i = 0; i < currentGames.length; i++) {
        const { game_id, game_name, max_players, player_count } = currentGames[i];
        games_list_html += "<div><div class='games-list-left'><label>" + game_name + "</label></div>" +
            "<div class='games-list-right'><label>" + player_count + "/" + max_players + "</label></div> ";
        if (player_count < max_players){
            games_list_html += "<div class='games-list-right'><form action='/lobby/joinGame' method='POST'><button class='btn btn-primary' name='join_btn' value=" + game_id + " type='submit'>Join</button></form></div>"
        }
        games_list_html+= "<div class='games-list-right'><form action='/lobby/observeGame' method='POST'><button class='btn btn-primary' name='watch_btn' value=" + game_id + " type='submit'>Watch</button></form></div></div>"
    }
    games_list_div.innerHTML = games_list_html;
});
