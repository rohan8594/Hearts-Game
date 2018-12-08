const gameSocket = io('/game');

let numPlayers;
let leftPlayerOrder, topPlayerOrder, rightPlayerOrder, bottomPlayerOrder;
let leftPlayer, topPlayer, rightPlayer, bottomPlayer;
let playerNames;
let playersCards;
let turnState;

gameSocket.on('LOAD PLAYERS', (data) => {
    const { gamePlayers} = data;

    numPlayers = gamePlayers.length;
    playerNames = gamePlayers;

    for(let i = 0; i < numPlayers; i++){
        if (username == gamePlayers[i]){
            bottomPlayerOrder = i;
            break;
        }
    }

    if(numPlayers == 4) {
        leftPlayerOrder = (bottomPlayerOrder + 1) % 4;
        topPlayerOrder = (bottomPlayerOrder + 2) % 4;
        rightPlayerOrder = (bottomPlayerOrder + 3) % 4;
    }
    else{
        topPlayerOrder = (bottomPlayer + 1) % 2;
    }
});

gameSocket.on('UPDATE GAME', (data) => {

    leftPlayer = data[leftPlayerOrder];
    topPlayer = data[topPlayerOrder];
    rightPlayer = data[rightPlayerOrder];
    bottomPlayer = data[rightPlayerOrder];

    gameSocket.emit('GET PLAYER HAND', user_id)//fetch hand, not emit/socket.io
});

gameSocket.on('PLAYER HAND', (data) => {
    const { state, hand } = data;

    //State: pass play or wait
    turnState = state;
    playersCards = hand;

    if(numPlayers == 4){
        updateBoardFourPlayers()
    }
    else{
        updateBoardTwoPlayers()
    }
});

function updateBoardTwoPlayers()
{
    const board = document.getElementsByClassName('game-box')[0];
    let gameHtml = '';
    let z = 1;

    gameHtml += '<div class = "top-player-info">' +
        '<p>' + playerNames[topPlayerOrder] + '</p>'+
        '<div class = "player-score-box">' +
        '<p class = "player-round-score">Score this round: ' + topPlayer.curScore + '</p>' +
        '<p class = "player-total-score">Total score: ' + topPlayer.totalScore + '</p>' +
        '</div></div>';
    let displacement = 540 - (26 - topPlayer.handSize) * 10;
    for(let i = 0; i < topPlayer.handSize; i++){
        gameHtml += '<div class= "top-player card-back" style="left: ' + displacement +
            'px; z-index: ' + z + ';"></div>';
        z++;
        displacement -= 20;
    }
    if (topPlayer.cardInPlay != 0){
        let suit = -(Math.floor((topPlayer.cardInPlay -1) / 13 )) * 100;
        let face = -((topPlayer.cardInPlay -1) % 13) * 69;
        gameHtml += '<div class = "top-player-to-mid card " style="background-position-y: ' + suit +
            'px; background-position-x: ' + face + 'px" id="' + topPlayer.cardInPlay + '"></div>'
    }

    let buttonString = '';
    if(turnState == "play")
    {
        buttonString = 'onclick="selectSingleCard(this.id)"';
        gameHtml += '<button class="game-button btn btn-primary" id="single-button" type="submit" disabled>Play</button>';
    }
    else if(turnState == "pass"){
        buttonString = 'onclick="selectMultipleCard(this.id)"';
        gameHtml += '<button class="game-button btn btn-primary " id="multiple-button" type="submit" disabled>Pass cards</button>';
    }
    else{
        buttonString = '';
        gameHtml += '<button class="game-button btn btn-primary" id="nudge-button" type="submit" disabled>Nudge</button>';
    }

    gameHtml += '<div class = "player-info">' +
        '<div class = "player-score-box">' +
        '<p class = "player-round-score">Score this round: ' + bottomPlayer.curScore + '</p>' +
        '<p class = "player-total-score">Total score: ' + bottomPlayer.totalScore + '</p>' +
        '</div>' +
        '<p>' + playerNames[bottomPlayerOrder] + '</p>'+
        '</div>';
    displacement = 170 + (13 - bottomPlayer.handSize) * 10;
    for(let i = 0; i < bottomPlayer.handSize; i++){
        let suit = -(Math.floor((playersCards[i] - 1) / 13 )) * 100;
        let face = -((playersCards[i] -1) % 13) * 69;
        gameHtml += '<div class= "bottom-player" style="left: ' + displacement +
            'px; z-index: ' + z + '; background-position-y: ' + suit +
            'px; background-position-x: ' + face + 'px" ' + buttonString +' id="'+ playersCards[i] +'"></div>';
        z++;
        displacement += 20;
    }
    if (bottomPlayer.cardInPlay != 0){
        let suit = -(Math.floor((bottomPlayer.cardInPlay -1)  / 13 )) * 100;
        let face = -((bottomPlayer.cardInPlay -1) % 13) * 69;
        gameHtml += '<div class = "bottom-player-to-mid card " style="background-position-y: ' + suit +
            'px; background-position-x: ' + face + 'px" id="' + bottomPlayer.cardInPlay + '"></div>'
    }

    board.innerHTML = gameHtml;
}

function updateBoardFourPlayers()
{
    const board = document.getElementsByClassName('game-box')[0];
    let gameHtml = '';
    let z = 1;

    gameHtml += '<div class = "left-player-info">' +
            '<div class = "player-score-box">' +
                '<p class = "player-round-score">Score this round: ' + leftPlayer.curScore + '</p>' +
                '<p class = "player-total-score">Total score: ' + leftPlayer.totalScore + '</p>' +
            '</div>' +
            '<p>' + playerNames[leftPlayerOrder] + '</p>'+
        '</div>';
    let displacement = 150 + (13 - leftPlayer.handSize) * 10;
    for(let i = 0; i < leftPlayer.handSize; i++){
        gameHtml += '<div class= "left-player card-back" style="top: ' + displacement +
            'px; z-index: ' + z + ';"></div>';
        z++;
        displacement += 20;
    }
    if (leftPlayer.cardInPlay != 0){
        let suit = -(Math.floor((leftPlayer.cardInPlay -1) / 13 )) * 100;
        let face = -((leftPlayer.cardInPlay -1) % 13) * 69;
        gameHtml += '<div class = "left-player-to-mid card " style="background-position-y: ' + suit +
            'px; background-position-x: ' + face + 'px" id="' + leftPlayer.cardInPlay + '"></div>'
    }

    gameHtml += '<div class = "top-player-info">' +
        '<p>' + playerNames[topPlayerOrder] + '</p>'+
        '<div class = "player-score-box">' +
        '<p class = "player-round-score">Score this round: ' + topPlayer.curScore + '</p>' +
        '<p class = "player-total-score">Total score: ' + topPlayer.totalScore + '</p>' +
        '</div></div>';
    displacement = 410 - (13 - topPlayer.handSize) * 10;
    for(let i = 0; i < topPlayer.handSize; i++){
        gameHtml += '<div class= "top-player card-back" style="left: ' + displacement +
            'px; z-index: ' + z + ';"></div>';
        z++;
        displacement -= 20;
    }
    if (topPlayer.cardInPlay != 0){
        let suit = -(Math.floor((topPlayer.cardInPlay -1) / 13 )) * 100;
        let face = -((topPlayer.cardInPlay -1) % 13) * 69;
        gameHtml += '<div class = "top-player-to-mid card " style="background-position-y: ' + suit +
            'px; background-position-x: ' + face + 'px" id="' + topPlayer.cardInPlay + '"></div>'
    }

    gameHtml += '<div class = "right-player-info">' +
        '<div class = "player-score-box">' +
        '<p class = "player-round-score">Score this round: ' + rightPlayer.curScore + '</p>' +
        '<p class = "player-total-score">Total score: ' + rightPlayer.totalScore + '</p>' +
        '</div>' +
        '<p>' + playerNames[rightPlayerOrder] + '</p>'+
        '</div>';
    displacement = 390 - (13 - rightPlayer.handSize) * 10;
    for(let i = 0; i < rightPlayer.handSize; i++){
        gameHtml += '<div class= "right-player card-back" style="top: ' + displacement +
            'px; z-index: ' + z + ';"></div>';
        z++;
        displacement -= 20;
    }
    if (rightPlayer.cardInPlay != 0){
        let suit = -(Math.floor((rightPlayer.cardInPlay -1) / 13 )) * 100;
        let face = -((rightPlayer.cardInPlay -1) % 13) * 69;
        gameHtml += '<div class = "right-player-to-mid card " style="background-position-y: ' + suit +
            'px; background-position-x: ' + face + 'px" id="' + rightPlayer.cardInPlay + '"></div>'
    }

    let buttonString = '';
    if(turnState == "play")
    {
        buttonString = 'onclick="selectSingleCard(this.id)"';
        gameHtml += '<button class="game-button btn btn-primary" id="single-button" type="submit" disabled>Play</button>';
    }
    else if(turnState == "pass"){
        buttonString = 'onclick="selectMultipleCard(this.id)"';
        gameHtml += '<button class="game-button btn btn-primary " id="multiple-button" type="submit" disabled>Pass cards</button>';
    }
    else{
        buttonString = '';
        gameHtml += '<button class="game-button btn btn-primary" id="nudge-button" type="submit" disabled>Nudge</button>';
    }

    gameHtml += '<div class = "player-info">' +
        '<div class = "player-score-box">' +
        '<p class = "player-round-score">Score this round: ' + bottomPlayer.curScore + '</p>' +
        '<p class = "player-total-score">Total score: ' + bottomPlayer.totalScore + '</p>' +
        '</div>' +
        '<p>' + playerNames[bottomPlayerOrder] + '</p>'+
        '</div>';
    displacement = 170 + (13 - bottomPlayer.handSize) * 10;
    for(let i = 0; i < bottomPlayer.handSize; i++){
        let suit = -(Math.floor((playersCards[i] - 1) / 13 )) * 100;
        let face = -((playersCards[i] -1) % 13) * 69;
        gameHtml += '<div class= "bottom-player" style="left: ' + displacement +
            'px; z-index: ' + z + '; background-position-y: ' + suit +
            'px; background-position-x: ' + face + 'px" ' + buttonString +' id="'+ playersCards[i] +'"></div>';
        z++;
        displacement += 20;
    }
    if (bottomPlayer.cardInPlay != 0){
        let suit = -(Math.floor((bottomPlayer.cardInPlay -1)  / 13 )) * 100;
        let face = -((bottomPlayer.cardInPlay -1) % 13) * 69;
        gameHtml += '<div class = "bottom-player-to-mid card " style="background-position-y: ' + suit +
            'px; background-position-x: ' + face + 'px" id="' + bottomPlayer.cardInPlay + '"></div>'
    }

    board.innerHTML = gameHtml;
}