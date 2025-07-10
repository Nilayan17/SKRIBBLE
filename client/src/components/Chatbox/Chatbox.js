import React, { useState } from "react";

const Chatbox = ({ messages, onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [sendTo, setsendTo] = useState("Everyone");
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    onSendMessage(message, sendTo);
    setMessage("");
    setsendTo("Everyone");
  };

  return (
    <div style={{ width: '400px', marginTop: '20px', marginLeft: '20px' }}>
      <div style={{
        border: '1px solid black',
        height: '200px',
        overflowY: 'auto',
        padding: '10px',
        marginBottom: '10px',
      }}>
        {messages.map((msg, index) =>
          msg.system ? (
            <p key={index} style={{ fontStyle: 'italic', color: 'green' }}>
              {msg.message}
            </p>
          ) : (
            <p key={index}>
              <strong>{msg.username}:</strong> {msg.message}
            </p>
          )
        )}
      </div>
      <form>
        <input
          type="text"
          placeholder="Everyone"
          style={{ width: '300px', padding: '10px', marginRight: '10px' }}
          value={sendTo}
          onChange={(e) => setsendTo(e.target.value)}
        />
      </form>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Guess..."
          style={{ width: '300px', padding: '10px', marginRight: '10px' }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>

    </div>
  );
};

export default Chatbox;
