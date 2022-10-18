import { io } from './http';

interface RoomUser {
  socket_id: string;
  username: string;
  room: string;
}

interface Message {
  room: string;
  text: string;
  createdAt: Date;
  username: string;
}

// array of all users
const users: RoomUser[] = [];

// array with all messages from all rooms
const messages: Message[] = [];

io.on('connection', socket => {
  socket.on('select_room', (snapshot, callback) => {
    socket.join(snapshot.room);

    const userInRoom = users.find(
      user => user.username === snapshot.username && user.room === snapshot.room
    );

    if (userInRoom) {
      userInRoom.socket_id = socket.id;
    } else {
      users.push({
        room: snapshot.room,
        username: snapshot.username,
        socket_id: socket.id,
      });
    }

    const msgsRoom = getMessagesRoom(snapshot.room);
    callback(msgsRoom);
  });

  socket.on('message', snapshot => {
    const msg: Message = {
      room: snapshot.room,
      username: snapshot.username,
      text: snapshot.msg,
      createdAt: new Date(),
    };

    messages.push(msg);

    io.to(snapshot.room).emit('message', msg);
  });
});

function getMessagesRoom(room: string) {
  const msgs = messages.filter(message => message.room === room);

  return msgs;
}
