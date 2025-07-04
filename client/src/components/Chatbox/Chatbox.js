import React, {useState, useEffect} from "react";
import io from "socket.io-client";

const socket = io('http://localhost:4000');

const Chatbox = ( {username, roomId} ) => {

   const [messages, setMessages] = useState([]);
   const [message, setMessage] = useState("");

   useEffect(() => {
      socket.emit('joinRoom', roomId);

      socket.on('chatMessage', ({ username, message }) => {
         setMessages((prev) => [...prev, { username, message }]);
      });

      socket.on('systemMessage', (message) => {
         setMessages((prev) => [...prev, {username: 'BigBoss', message}]);
      });

      socket.on('guessResult', ( {username, success}) => {
         if(success) {
            setMessages((prev) => [...prev, {username: `${username} guessed correctly!` }]);
         }
      })

      return () => {
         socket.off('chatMessage');
         socket.off('systemMessage');
         socket.off('guessResult');
      };

   }, [roomId]);

   const sendMessage = (e) => {
      e.preventDefault();
      if(message.trim() === "") return;
      socket.emit('chatMessage', { username, message , roomId});
      setMessages((prev) => [...prev, { username, message }]);
      setMessage("");
   };

   return (
      <div style={{width : '400px', marginTop : '20px', marginLeft : '20px'}}>
         <div style = {{
            border : '1px solid black',
            height : '200px',
            overflowY : 'auto',
            padding : '10px',
            marginBottom : '10px',
         }}>

            {messages.map((msg, index)=>
               msg.system ? (
                  <p key = {index} style = {{fontStyle : 'italic', color : 'green'}}> {msg.message} </p>
               ) : (<p key = {index}>
                  <strong>{msg.username}:</strong> {msg.message}</p>)
            )}
         </div>
         <form onSubmit = {sendMessage}>
            <input
               type="text"
               placeholder="Guess..."
               style={{width: '300px', padding: '10px', marginRight: '10px'}} 
               value = {message}
               onChange = {(e) => setMessage(e.target.value)}
            />
            <button type="submit" > Submit </button>
         </form>
      </div>
   );
}

export default Chatbox;