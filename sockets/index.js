io = require('socket.io')();

io.on('connection', (socket) => {
    console.log('Made a socket connection');

    socket.on('entered lobby', (data) => {
        console.log('Entered');
        io.emit('entry msg', data);
    });

    socket.on('chat', (data) => {
        io.emit('send msg', data);
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing msg', data);
    })
});

module.exports = io;