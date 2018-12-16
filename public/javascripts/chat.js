const chatSocket = io();
// Query DOM
let msg = document.getElementById('message'),
  room = document.getElementById('room_id'),
  btn = document.getElementById('send'),
  output = document.getElementById('output'),
  feedback = document.getElementById('feedback');

window.addEventListener('load', () => {
  chatSocket.emit('entered', {
    room_id: room.value,
    handle: username
  })
});

btn.addEventListener('click', () => {
  chatSocket.emit('chat', {
    room_id: room.value,
    message: msg.value,
    handle: username
  });
  msg.value = '';
});

msg.addEventListener('keypress', (events) => {
  if (msg.value != '' && events.code == 'Enter') {
    chatSocket.emit('chat', {
      room_id: room.value,
      message: msg.value,
      handle: username
    });
    msg.value = '';
  } else {
    chatSocket.emit('typing', {
      room_id: room.value,
      handle: username
    });
  }
});

// Listen for events
chatSocket.on('send msg', (data) => {
  const { room_id, handle, message } = data;

  if (room.value == room_id) {
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + handle + ': </strong>' + message + '</p>'
  }
});

chatSocket.on('entry msg', (data) => {
  const { room_id, handle } = data;

  if (room.value == room_id) {
    if (room.value == 0) {
      output.innerHTML += '<p style="color: #aaa;"><em>' + handle + ' has entered the lobby...</em></p>'
    } else {
      output.innerHTML += '<p style="color: #aaa;"><em>' + handle + ' has entered the room...</em></p>'
    }
  }
});

chatSocket.on('typing msg', (data) => {
  const { room_id, handle } = data;

  if (room.value == room_id) {
    feedback.innerHTML = '<p><em>' + handle + ' is typing a message...</em></p>'
  }
});