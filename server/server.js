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

const {rooms, joinRoom, startGame, handleGuess} = require('./gameController');

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
      console.log('recieved from server');
      console.log(data);
      const roomId = data.roomId;
      // console.log(roomId);
      
      // console.log(`User ${username} started drawing in room: ${roomId}`);
      if(rooms) {
         // console.log(rooms[roomId]);
         const drawerindex = rooms[roomId].currentDrawerIndex;
         // console.log(drawerindex);
         // console.log("username = ", data.username);
         // console.log("drawerindex = ", drawerindex);
         // console.log("rooms[roomId].users[drawerindex] = ", rooms[roomId].users[drawerindex]);
         if(data.username === rooms[roomId].users[drawerindex].username) {
            // console.log("YES");
            io.to(roomId).emit('startDrawing', data);
         }
      }
   });
   socket.on('draw', (data) => {
      const roomId = data.roomId;
      const username = data.username;
      // console.log(`User ${username} is drawing in room: ${roomId}`);
      if(rooms) {
         const drawerindex = rooms[roomId].currentDrawerIndex;
         if(username === rooms[roomId].users[drawerindex].username) {
            // console.log("YES");
            io.to(roomId).emit('draw', data);
         }
      }
      // socket.to(roomId).emit('draw', data);
   });

   socket.on('clear', (data) => {
      const roomId = data.roomId;
      io.to(roomId).emit('clear', data);
   });

   socket.on('stopDrawing', (data) => {
      const roomId = data.roomId;
      const username = data.username;
      if(rooms[roomId]){ 
         const drawerindex = rooms[roomId].currentDrawerIndex;
         if(username === rooms[roomId].users[drawerindex].username) {
            // console.log("YES");
            io.to(roomId).emit('stopDrawing', data);
         }
      }
      // socket.to(roomId).emit('stopDrawing', data);
   });
   
   socket.on('chatMessage', (data) => {
      console.log(data);
      const sendTo = data.sendTo;
      console.log("sendTo = ", sendTo);
      if(sendTo === "Everyone") {
         handleGuess(io, socket, data.username, data.message, data.roomId);
      }
      else {
         if(rooms[data.roomId]) {
            const room = rooms[data.roomId];
            const user = room.users.find(user => user.username === sendTo);
            console.log("user = ", user);
            console.log(data);
            socket.to(user.id).emit('chatMessage', data);
         }
      }
   });

   socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
   });
})
server.listen(4000, () => {
   console.log('Server running on port 4000');
})