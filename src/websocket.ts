import { io } from './http';
import { Pool } from 'pg';

interface RoomUser {
  socket_id: string;
  username: string;
  room: string;
}

interface Message {
  room: string;
  textmessage: string;
  createdat: Date;
  username: string;
}

// array of all users
const users: RoomUser[] = [];

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

    getMessagesRoom(snapshot.room).then(res => {
      callback(res);
    });
  });

  socket.on('message', snapshot => {
    const msg: Message = {
      room: snapshot.room,
      username: snapshot.username,
      textmessage: snapshot.msg,
      createdat: new Date(),
    };

    insertMessagesRoom(msg);

    io.to(snapshot.room).emit('message', msg);
  });
});

async function insertMessagesRoom(msg: Message) {
  // insert message to database
  (await connect()).query(
    `INSERT INTO messages (room,textmessage,createdAt,username) VALUES ($1,$2,$3,$4)`,
    [msg.room, msg.textmessage, msg.createdat, msg.username]
  );
}

async function getMessagesRoom(room: string) {
  // fetching message data from db
  const data = await (await connect()).query(`SELECT * FROM messages WHERE room = $1`, [room]);

  return data.rows;
}
// < ------------ POSTGRES ------------ >
async function connect() {
  const pool = new Pool({
    connectionString: 'postgres://postgres:password@localhost:5432/messages',
  });
  return pool.connect();
}
// < ------------ END POSTGRES ------------ >
