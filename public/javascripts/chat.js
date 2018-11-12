const chatSocket = io();

// Query DOM
let msg = document.getElementById('message'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback');

window.addEventListener('load', () => {
    chatSocket.emit('entered lobby', username);
});

btn.addEventListener('click', () => {
    chatSocket.emit('chat', {
        message: msg.value,
        handle: username
    })
});

msg.addEventListener('keypress', () => {
   chatSocket.emit('typing', username)
});

// Listen for events
chatSocket.on('send msg', (data) => {
    const { handle, message } = data;

    feedback.innerText = '';
    output.innerHTML += '<p><strong>' + handle + ': </strong>' + message + '</p>'
});

chatSocket.on('entry msg', (data) => {
    output.innerHTML += '<p style="color: #aaa;"><em>' + data + ' has entered the room...</em></p>'
});

chatSocket.on('typing msg', (data) => {
   feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>'
});