// gameController.js

const rooms = {};

const getRandomWord = () => {
  const words = ['apple', 'car', 'banana', 'house', 'moon', 'cat'];
  return words[Math.floor(Math.random() * words.length)];
};

const getPointsForGuess = (order) => {
  return Math.max(10 - (order - 1) * 2, 2);
};

function joinRoom(io, socket, roomId, username) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      users: [],
      currentDrawerIndex: 0,
      currentWord: '',
      gameState: 'waiting',
      round: 0,
      maxRounds: 3,
      guessedUsers: new Set()
    };
  }

  const alreadyInRoom = rooms[roomId].users.some(u => u.id === socket.id);
  if (!alreadyInRoom) {
    rooms[roomId].users.push({ id: socket.id, username, score: 0 });
  }

  socket.join(roomId);
  io.to(roomId).emit('updateUsers', rooms[roomId].users);
}

function startGame(io, roomId) {
  const room = rooms[roomId];
  if (!room) return;

  room.round = 1;
  room.currentDrawerIndex = 0;
  startRound(io, roomId);
}

function startRound(io, roomId) {
  const room = rooms[roomId];
  if (!room) return;

  const drawer = room.users[room.currentDrawerIndex];
  room.currentWord = getRandomWord();
  room.gameState = 'drawing';
  room.guessedUsers = new Set();

  io.to(drawer.id).emit('yourTurnToDraw', room.currentWord);
  io.to(roomId).emit('systemMessage', `${drawer.username} is drawing!`);
}

function handleGuess(io, socket, username, message, roomId) {
  const room = rooms[roomId];
  console.log(room);
  if (!room) return;

  const isCorrect = message.trim().toLowerCase() === room.currentWord.toLowerCase();

  if (isCorrect && !room.guessedUsers.has(socket.id)) {
    room.guessedUsers.add(socket.id);
    const player = room.users.find(u => u.id === socket.id);
    if (player) {
      player.score += getPointsForGuess(room.guessedUsers.size);
    }

    io.to(roomId).emit('guessResult', { username:username, success:true });
    // socket.to(roomId).emit('systemMessage', `${username} guessed correctly!`);
  } else {
    socket.to(roomId).emit('chatMessage', { username, message, roomId });
  }

  if (room.guessedUsers.size === room.users.length - 1) {
    setTimeout(() => endRound(io, roomId), 2000);
  }
}

function endRound(io, roomId) {
  const room = rooms[roomId];
  if (!room) return;

  room.currentDrawerIndex++;
  if (room.currentDrawerIndex >= room.users.length) {
    room.round++;
    room.currentDrawerIndex = 0;
  }

  if (room.round > room.maxRounds) {
    endGame(io, roomId);
  } else {
    io.to(roomId).emit('systemMessage', `Next round starting...`);
    setTimeout(() => startRound(io, roomId), 3000);
  }
}

function endGame(io, roomId) {
  const room = rooms[roomId];
  if (!room) return;

  room.gameState = 'ended';
  const leaderboard = [...room.users].sort((a, b) => b.score - a.score);
  io.to(roomId).emit('gameOver', leaderboard);
}

function removeUser(io, socket) {
  for (const roomId in rooms) {
    const room = rooms[roomId];
    const index = room.users.findIndex(u => u.id === socket.id);
    if (index !== -1) {
      room.users.splice(index, 1);
      io.to(roomId).emit('updateUsers', room.users);
    }
  }
}

module.exports = {
  joinRoom,
  startGame,
  handleGuess,
  endGame,
  endRound,
  removeUser
 };