const lobbySocket = io('/lobby');

let createGameBtn = document.getElementById('create-game-btn'),
    max_players = document.getElementById('max-players').value;

createGameBtn.addEventListener('click', () => {
    const game_name = document.getElementById('game-name').value;

    fetch('/lobby/createGame', {
        body: JSON.stringify({
            user_id: user_id,
            username: username,
            max_players: max_players,
            game_name: game_name
        }),
        method: 'post',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
});

lobbySocket.on('enter game room', (game_id) => {
    const path = window.location.origin + '/game/' + game_id;
    window.location.replace(path)
});

lobbySocket.on('display games list', (currentGames) => {
    let games_list_div = document.getElementsByClassName('games-list-box')[0];
    let games_list_html = '';

    for (let i = 0; i < currentGames.length; i++) {
        const { game_id, max_players, game_name } = currentGames[i];
        games_list_html += "<div><div class='games-list-left' style='width: 25%'><label>" + game_name + "</label></div>" +
            "<div class='games-list-right'><label>Max players: " + max_players + "</label></div>" +
            "<div class='games-list-right'><button class='btn btn-primary' id='join-btn' type='submit'>Join</button></div>" +
            "<div class='games-list-right'><button class='btn btn-primary' id='watch-btn' type='submit'>Watch</button></div></div>"
    }
    games_list_div.innerHTML = games_list_html;
});