const lobbySocket = io('/lobby');

lobbySocket.on('display games list', (currentGames) => {
    let games_list_div = document.getElementsByClassName('games-list-box')[0];
    let games_list_html = '';

    for (let i = 0; i < currentGames.length; i++) {
        const { game_name, max_players, player_count } = currentGames[i];
        games_list_html += "<div><div class='games-list-left' style='width: 25%'><label>" + game_name + "</label></div>" +
            "<div class='games-list-right'><label>" + player_count + "/" + max_players + "</label></div>" +
            "<div class='games-list-right'><button class='btn btn-primary' id='join-btn' type='submit'>Join</button></div>" +
            "<div class='games-list-right'><button class='btn btn-primary' id='watch-btn' type='submit'>Watch</button></div></div>"
    }
    games_list_div.innerHTML = games_list_html;
});