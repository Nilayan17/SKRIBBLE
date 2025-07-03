import React from 'react';
import Canvas from './components/Canvas';
import Chatbox from './components/Chatbox';


function App() {
  return (
    <div className='App' style={{display: 'flex', alignItems: 'center'}}>
      <h1> Skribble </h1>
      <Canvas />
      <Chatbox username = {"Player" + Math.floor(Math.random() * 1000)}/>
    </div>
  );
}

export default App;