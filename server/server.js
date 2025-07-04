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

let currentWord = 'cat';
const roomWords = {};

io.on('connection', (socket) => {
   console.log('A user connected:', socket.id);

   socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
   });

   socket.on ('startDrawing', (data) => {
      console.log(data);
      const roomId = data.roomId;
      const username = data.username;
      console.log(`User ${username} started drawing in room: ${roomId}`);
      socket.to(roomId).emit('startDrawing', data);
   });
   socket.on('draw', (data) => {
      const roomId = data.roomId;
      const username = data.username;
      console.log(`User ${username} is drawing in room: ${roomId}`);
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
   
   socket.on('chatMessage', ({ username, message, roomId }) => {
      const isCorrect = message.trim().toLowerCase() === currentWord.toLowerCase();
      if(isCorrect) {
         socket.to(socket.id).emit('guessResult', { username, message, success: true });
         socket.to(roomId).emit('systemMessage', `${username} guessed the word correctly!`);
      } else {
         socket.to(roomId).emit('chatMessage', { username, message });
      }
   });

   socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
   });
})
server.listen(4000, () => {
   console.log('Server running on port 4000');
})