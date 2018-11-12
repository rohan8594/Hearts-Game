const chatSocket = io();

// Query DOM
let msg = document.getElementById('message'),
    btn = document.getElementById('send'),
    output = document.getElementById('output');

btn.addEventListener('click', () => {
    chatSocket.emit('chat', {
        message: msg.value,
        handle: username
    })
});

// Listen for events
chatSocket.on('send msg', (data) => {
    const { handle, message } = data;
    output.innerHTML += '<p><strong>' + handle + ': </strong>' + message + '</p>'
});

chatSocket.on('entry msg', () => {
    output.innerHTML += '<p>' + username + ' has entered the room...</p>'
});