const gameSocket = io('/game');

gameSocket.on('START GAME', (data) => {
    const { cardsDeck, gamePlayers } = data;

    console.log(gamePlayers);
    console.log(cardsDeck);
});