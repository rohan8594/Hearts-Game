const gameSocket = io('/game');

gameSocket.on('START GAME', (data) => {
    const { gamePlayers, game_id } = data;

    for (let i = 0; i < gamePlayers.length; i++) {
        if (user_id == gamePlayers[i].user_id) {
            gameSocket.emit('GET PLAYER HAND', { user_id: gamePlayers[i].user_id, game_id: game_id })
        }
    }
});