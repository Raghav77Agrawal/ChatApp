const io = require('socket.io-client');

const NUM_CLIENTS = 500;
const URL = 'http://localhost:5000';

for (let i = 0; i < NUM_CLIENTS; i++) {
  const socket = io(URL);

  socket.on('connect', () => {
    console.log(`Client ${i} connected: ${socket.id}`);
    socket.emit('init', `user-${i}`);
    socket.emit('findPartner');
  });

  socket.on('partnerfound', (roomid) => {
    console.log(`Client ${i} found partner in room: ${roomid}`);
    socket.emit('message', `Hello from client ${i}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client ${i} disconnected`);
  });

  socket.on('connect_error', (err) => {
    console.error(`Client ${i} connection error: ${err.message}`);
  });
}
