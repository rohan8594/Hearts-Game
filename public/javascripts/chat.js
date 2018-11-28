const chatSocket = io();

// Query DOM
let msg = document.getElementById('message'),
    room_id = document.getElementById('room_id'),
    btn = document.getElementById('send'),
    lobby_output = document.getElementById('lobby_output'),
    game_output = document.getElementById('game_output'),
    lobby_feedback = document.getElementById('lobby_feedback'),
    game_feedback = document.getElementById('game_feedback');

window.addEventListener('load', () => {
    chatSocket.emit('entered', {
        room_id: room_id.value,
        handle: username
    })
});

btn.addEventListener('click', () => {
    chatSocket.emit('chat', {
        room_id: room_id.value,
        message: msg.value,
        handle: username
    })
    msg.value = '';
});

msg.addEventListener('keypress', () => {
   chatSocket.emit('typing', {
    room_id: room_id.value,
    handle: username
   })
});

// Listen for events
chatSocket.on('send msg', (data) => {
    const { handle, message, room_id } = data;
    if (room_id == 'lobby') {
        lobby_feedback.innerHTML = '';
        lobby_output.innerHTML += '<p><strong>' + handle + ': </strong>' + message + '</p>'
    } else {
        game_feedback.innerHTML = '';
        game_output.innerHTML += '<p><strong>' + handle + ': </strong>' + message + '</p>'
    }
    
});

chatSocket.on('entry msg', (data) => {
    const { handle, room_id } = data;
    alert(room_id);
    if (room_id == 'lobby') {
        lobby_output.innerHTML += '<p style="color: #aaa;"><em>' + handle + ' has entered the lobby...</em></p>'
    } else {
        game_output.innerHTML += '<p style="color: #aaa;"><em>' + handle + ' has entered the room...</em></p>'
    }
});

chatSocket.on('typing msg', (data) => {
    const { handle, room_id } = data;
    if (room_id == 'lobby') {
        lobby_feedback.innerHTML = '<p><em>' + handle + ' is typing a message...</em></p>'
    } else {
        game_feedback.innerHTML = '<p><em>' + handle + ' is typing a message...</em></p>'
    }
   
});