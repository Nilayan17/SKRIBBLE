import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Chatbox from '../Chatbox/Chatbox';

const socket = io('http://localhost:4000');

const Game = ({ username, roomId }) => {
  const [gameState, setGameState] = useState('waiting'); // 'guessing', 'drawing', 'ended'
  const [word, setWord] = useState('');
  const [drawer, setDrawer] = useState('');
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.emit('joinRoom', { roomId, username });

    socket.on('yourTurnToDraw', (word) => {
      setWord(word);
      setGameState('drawing');
    });

    socket.on('startRound', ({ drawer, round, totalRounds }) => {
      setDrawer(drawer);
      setRound(round);
      setTotalRounds(totalRounds);
      setWord('');
      setGameState('guessing');
    });

    socket.on('guessResult', ({ username, success }) => {
      if (success) {
        setChatMessages((prev) => [
          ...prev,
          { system: true, message: `${username} guessed correctly!` }
        ]);
      }
    });

    socket.on('chatMessage', (data) => {
      // console.log('received from server');
      // console.log("hello");
      // console.log('roomId = ', roomId);
      // console.log("username = ", username);
      // console.log("message = ", msg);
      console.log("data = ", data);
      const username = data.username;
      const message = data.message;
      setChatMessages((prev) => [...prev, { username, message }]);
    });

    socket.on('systemMessage', (message) => {
      setChatMessages((prev) => [...prev, { system: true, message }]);
    });

    socket.on('gameOver', (lb) => {
      setLeaderboard(lb);
      setGameState('ended');
    });

    socket.on('updateUsers', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('yourTurnToDraw');
      socket.off('startRound');
      socket.off('guessResult');
      socket.off('chatMessage');
      socket.off('systemMessage');
      socket.off('gameOver');
      socket.off('updateUsers');
    };
  }, [roomId, username]);

  const handleSendMessage = (message, sendTo) => {
    socket.emit('chatMessage', {username, message, roomId, sendTo});
    console.log("emitted to server");
    setChatMessages((prev) => [...prev, { username, message }]);
  };

  const handleStartGame = () => {
    socket.emit('startGame', roomId);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Room: {roomId}</h2>
      {gameState === 'drawing' && <p>You are drawing! Your word: <b>{word}</b></p>}
      {gameState === 'guessing' && <p>{drawer} is drawing! Round {round} of {totalRounds}</p>}
      {gameState === 'ended' && (
        <div>
          <h3 className="text-lg font-bold">Game Over!</h3>
          <ul>
            {leaderboard.map((user, i) => (
              <li key={i}>{user.username}: {user.score} pts</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <button onClick={handleStartGame} className="bg-blue-500 text-white px-3 py-1 rounded">
          Start Game
        </button>
      </div>

      <Chatbox messages={chatMessages} onSendMessage={handleSendMessage} />

      <div className="mt-4">
        <h4 className="font-semibold">Players:</h4>
        <ul>
          {users.map((u, i) => (
            <li key={i}>{u.username}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Game;
