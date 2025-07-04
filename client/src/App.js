import React, { useState } from 'react';
import Canvas from './components/Canvas/Canvas';
import Chatbox from './components/Chatbox/Chatbox';
import Lobby from './components/Lobby/Lobby';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleCreateRoom = (name) => {
    setUsername(name);
    const newRoomId = Math.random().toString(36).substring(2, 8);
    setRoomId(newRoomId);
  };

  const handleJoinRoom = (name, room) => {
    setUsername(name);
    setRoomId(room);
    socket.emit('joinRoom', room);
  };

  return (
    <div>
      <h1>SKRIBBLE</h1>
      {(!username || !roomId) ? (
        <Lobby onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      ) : (
        <div className='App' style={{ display: 'flex', alignItems: 'center' }}>
          <div>
            <h2>Welcome, {username}!</h2>
            <p>Room ID: {roomId}</p>
          </div>
          <Canvas roomId = {roomId} username = {username}/>
          <Chatbox username={username} roomId = {roomId}/>
        </div>
      )}
    </div>
  );
}

export default App;