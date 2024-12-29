const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: [ "GET", "POST" ]
	}
})
let waitingQueue = [];
let activeUsers = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (username) => {
    activeUsers[socket.id] = { username, peer: null };

    // Check for match
    if (waitingQueue.length > 0) {
      const peerId = waitingQueue.shift();
      activeUsers[socket.id].peer = peerId;
      activeUsers[peerId].peer = socket.id;

      io.to(socket.id).emit('matched', peerId);
      io.to(peerId).emit('matched', socket.id);
    } else {
      waitingQueue.push(socket.id);
    }
  });

  socket.on('skip', () => {
    const peerId = activeUsers[socket.id]?.peer;

    if (peerId) {
      activeUsers[peerId].peer = null;
      waitingQueue.push(peerId);
      io.to(peerId).emit('disconnected');
    }

    activeUsers[socket.id].peer = null;
    waitingQueue.push(socket.id);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);

    const peerId = activeUsers[socket.id]?.peer;
    if (peerId) {
      activeUsers[peerId].peer = null;
      waitingQueue.push(peerId);
      io.to(peerId).emit('disconnected');
    }

    waitingQueue = waitingQueue.filter((id) => id !== socket.id);
    delete activeUsers[socket.id];
  });
});

server.listen(3003, () => {
  console.log('Server is running on http://localhost:3000');
});
