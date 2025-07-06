import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const Canvas = ({roomId, username}) => {
   const canvasRef = useRef(null);
   const contextRef = useRef(null);
   const [isDrawing ,setIsDrawing] = useState(false);
   
   useEffect(() => {
      const canvas = canvasRef.current;
      // console.log(canvas.width);
      // canvas.width = window.innerWidth * 0.9;
      // canvas.height = window.innerHeight * 0.7;
      canvas.width = 800; 
      canvas.height = 600; 
      canvas.style.border = '2px solid black';

      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.strokeStyle = 'black';
      context.lineWidth = 3;
      contextRef.current = context;

      socket.emit('joinRoom', {roomId,username});
      
      socket.on('startDrawing', (data) => {
         const {offsetX, offsetY} = data;
         contextRef.current.beginPath();
         contextRef.current.moveTo(offsetX, offsetY);
         contextRef.current.lineTo(offsetX, offsetY);
         contextRef.current.stroke();
      })
      socket.on('draw', (data) => {
         contextRef.current.lineTo(data.offsetX, data.offsetY);
         contextRef.current.stroke();
         contextRef.current.beginPath();
         contextRef.current.moveTo(data.offsetX, data.offsetY);
      });

      socket.on('stopDrawing', () => {
         contextRef.current.closePath();
      });

      socket.on('clear', () => {
         contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      })

      return () => {
         socket.off('startDrawing');
         socket.off('draw');
         socket.off('stopDrawing');
         socket.off('clear');
      };
   }, [roomId]);

   const startDrawing = ({nativeEvent}) => {
      console.log("attempting to draw");
      const {offsetX, offsetY} = nativeEvent;
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
      setIsDrawing(true);
      socket.emit('startDrawing', 
         {offsetX, offsetY, roomId , username});
   };

   const draw = ({nativeEvent}) => {
      if (!isDrawing) {
         return;
      }
      const {offsetX, offsetY} = nativeEvent;
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      socket.emit('draw', {offsetX, offsetY, roomId , username});
   };

   const stopDrawing = () => {
      contextRef.current.closePath();
      setIsDrawing(false);
      socket.emit('stopDrawing', {roomId , username});
   };

   const clearCanvas = () => {
      const canvas = canvasRef.current;
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      socket.emit('clear', {roomId , username});
   }

   return (
      <div className='canvas-container' style={{margin: '20px'}}>
         <canvas 
            ref = {canvasRef}
            onMouseDown = {startDrawing}
            onMouseMove = {draw}
            onMouseUp = {stopDrawing}
            onMouseLeave = {stopDrawing}
            onClick = {draw}
         />
         <br />
         <button onClick = { clearCanvas }> Clear Drawing </button>
      </div>
   );
}


export default Canvas;