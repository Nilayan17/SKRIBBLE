import React, { useState } from 'react';

const Lobby = ({ onCreateRoom, onJoinRoom }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <h2>Lobby</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        style={{ padding: '0.5rem', width: '200px' }}
      />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => username && onCreateRoom(username)}
          style={{ padding: '0.5rem 1rem' }}
        >
          Create Room
        </button>
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
          style={{ padding: '0.5rem', width: '120px' }}
        />
        <button
          onClick={() => username && roomId && onJoinRoom(username, roomId)}
          style={{ padding: '0.5rem 1rem' }}
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default Lobby;