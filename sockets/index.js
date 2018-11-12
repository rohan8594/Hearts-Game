io = require('socket.io')();

io.on('connection', (socket) => {
    console.log('Made a socket connection');

    socket.emit('entry msg');

    socket.on('chat', (data) => {
        io.emit('send msg', data);
    })
});

module.exports = io;