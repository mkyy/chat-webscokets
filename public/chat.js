const socket = io();

const urlSearch = new URLSearchParams(window.location.search);
const username = urlSearch.get('username');
const room = urlSearch.get('select_room');

document.getElementById(
  'welcome'
).innerText = `Olá, ${username}. Você está conectado na sala ${room}`;

// emit => emitir
// on => listen

socket.emit(
  'select_room',
  {
    username,
    room,
  },
  res => {
    res.forEach(item => createMsg(item));
  }
);

document.getElementById('message_input').addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    const msg = e.target.value;

    const data = {
      room,
      msg,
      username,
    };

    socket.emit('message', data);

    e.target.value = '';
  }
});

socket.on('message', snapshot => {
  createMsg(snapshot);
});

function createMsg(msgData) {
  const messageDiv = document.getElementById('messages');

  const newMsg = document.createElement('div');
  newMsg.className = 'new_message';
  newMsg.innerHTML = `
  <p id='text'>${msgData.textmessage}</p>
  <p id='username'>${msgData.username} | ${msgData.createdat}</p>
  `;

  messageDiv.appendChild(newMsg);
}
