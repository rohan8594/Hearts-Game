const chatSocket = io();

// Query DOM
let msg = document.getElementById('message'),
    room_id = document.getElementById('room_id'),
    btn = document.getElementById('send'),
    lobby_output = document.getElementById('lobby_output'),
    game_output = document.getElementById('game_output'),
    feedback = document.getElementById('feedback');

window.addEventListener('load', () => {
    chatSocket.emit('entered lobby', username);
});

btn.addEventListener('click', () => {
    chatSocket.emit('chat', {
        room_id: room_id.value,
        message: msg.value,
        handle: username
    })
});

msg.addEventListener('keypress', () => {
   chatSocket.emit('typing', username)
});

// Listen for events
chatSocket.on('send msg', (data) => {
    const { handle, message, room_id } = data;

    feedback.innerHTML = '';
    if (room_id == 'lobby') {
        lobby_output.innerHTML += '<p><strong>' + handle + ': </strong>' + message + '</p>'
    } else {
        game_output.innerHTML += '<p><strong>' + handle + ': </strong>' + message + '</p>'
    }
    
});

chatSocket.on('entry msg', (data) => {
    output.innerHTML += '<p style="color: #aaa;"><em>' + data + ' has entered the room...</em></p>'
});

chatSocket.on('typing msg', (data) => {
   feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>'
});