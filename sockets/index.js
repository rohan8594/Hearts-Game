io = require('socket.io')();

io.on('connection', (socket) => {
  console.log('Made a socket connection');

  socket.on('disconnect', data => {
    console.log('Client disconnected');
  });

  socket.on('entered', (data) => {
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