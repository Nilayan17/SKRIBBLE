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
io.on('connection', (socket) => {
   console.log('A user connected:', socket.id);

   socket.on ('startDrawing', (data) => {
      socket.broadcast.emit('startDrawing', data);
   })
   socket.on('draw', (data) => {
      socket.broadcast.emit('draw', data);
   })

   socket.on('clear', () => {
      socket.broadcast.emit('clear');
   })

   socket.on('stopDrawing', () => {
      socket.broadcast.emit('stopDrawing');
   });
   
   socket.on('chatMessage', ({ username, message }) => {
      const isCorrect = message.trim().toLowerCase() === currentWord.toLowerCase();
      if(isCorrect) {
         socket.to(socket.id).emit('guessResult', { username, message, success: true });
         socket.broadcast.emit('systemMessage', `${username} guessed the word correctly!`);
      } else {
         socket.broadcast.emit('chatMessage', { username, message });
      }
   });

   socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
   });
})
server.listen(4000, () => {
   console.log('Server running on port 4000');
})