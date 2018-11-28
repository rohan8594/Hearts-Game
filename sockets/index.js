io = require('socket.io')();

io.on('connection', (socket) => {
    console.log('Made a socket connection');

    socket.on('disconnect', data => {
        console.log('client disconnected');
    })

    socket.on('entered', (data) => {
        console.log('entering...');
        console.log('entered: '+ data.room_id);
        io.emit('entry msg', data);
    });

    socket.on('chat', (data) => {
        console.log('chat: '+ data);
        io.emit('send msg', data);
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing msg', data);
    })
});

module.exports = io;