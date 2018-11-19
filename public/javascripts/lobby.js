const lobbySocket = io();

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

lobbySocket.on('broadcast game', (game_id) => {
    const path = window.location.origin + '/game/' + game_id;
    window.location.replace(path)
});