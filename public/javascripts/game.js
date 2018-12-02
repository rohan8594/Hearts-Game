const gameSocket = io('/game');

let msg = document.getElementById('message'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback');

gameSocket.on('Entered game', (data) => {
    let { username, user_id } = data.user;
    output.innerHTML += '<p style="color: #aaa;"><em>' + username + ' has entered room ' + data.game_id + '...</em></p>'
});

gameSocket.on('Left game', (data) => {
    let { username, user_id } = data.user;
    output.innerHTML += '<p style="color: #aaa;"><em>' + username + ' has left the room...</em></p>'
});