const express = require('express');
const http = require('http');

const {Server} = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
   cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
   }
});

const {joinRoom, startGame, handleGuess} = require('./gameController');

io.on('connection', (socket) => {
   console.log('A user connected:', socket.id);
   
   socket.on('joinRoom', (data) => {
      const {roomId, username} = data;
      joinRoom(io,socket,roomId,username);
   });

   socket.on('startGame', (roomId) => {
      startGame(io, roomId);
   });

   socket.on ('startDrawing', (data) => {
      console.log(data);
      const roomId = data.roomId;
      const username = data.username;
      // console.log(`User ${username} started drawing in room: ${roomId}`);
      socket.to(roomId).emit('startDrawing', data);
   });
   socket.on('draw', (data) => {
      const roomId = data.roomId;
      const username = data.username;
      // console.log(`User ${username} is drawing in room: ${roomId}`);
      socket.to(roomId).emit('draw', data);
   });

   socket.on('clear', (data) => {
      const roomId = data.roomId;
      const username = data.username;
      socket.to(roomId).emit('clear', data);
   });

   socket.on('stopDrawing', (data) => {
      const roomId = data.roomId;
      const username = data.username;
      socket.to(roomId).emit('stopDrawing', data);
   });
   
   socket.on('chatMessage', (data) => {
      console.log(data);
      handleGuess(io, socket, data.username, data.msg, data.roomId);
   });

   socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
   });
})
server.listen(4000, () => {
   console.log('Server running on port 4000');
})