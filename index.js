require('dotenv').config()
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const UserRouter = require('./controller/users');
const app = express();
const cookieparser = require('cookie-parser');

const cors = require('cors');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });




//mongodb connection

mongoose.connect("mongodb://127.0.0.1:27017/ourapp")
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Database connection error:', err));

// Middleware and Routes
app.use('/m', UserRouter);
app.use(express.json());
app.use(cookieparser());
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true, //for cookies authentication
    allowedHeaders: ['Content-Type', 'Authorization'],             
  }));
const ourmap = new Map();
let queue = [];
//connection build sockets
io.on('connection' , (socket)=>{
   //search for partner in queue
    socket.on('findPartner' , ()=>{

        
        if(queue.includes(socket.id)){
            socket.emit('Already exist');
        }
        else if(queue.length>0){

            const partnerid = queue.shift();
            //removing partner from queue as connection is build
            const partnerSocket = io.sockets.sockets.get(partnerid);
            if(partnerSocket){
queue = queue.filter(id=>(id!==socket.id && id!==partnerid));
const roomid = `${socket.id}#${partnerid}`;
ourmap.set(socket.id,roomid);
ourmap.set(partnerid, roomid);
socket.join(roomid);
partnerSocket.join(roomid);
socket.emit('partnerfound', roomid);
partnerSocket.emit('partnerfound', roomid);

            }
            else{
                queue.push(socket.id);
                socket.emit('Finding');
            }
        }
        else{
            queue.push(socket.id);
            
            socket.emit('Finding');
        }
    })
    //Sending msg to partner user
    socket.on('message', (message)=>{
        socket.to(ourmap.get(socket.id)).emit('mymessage' ,{msg:message, sender:socket.id});
    })
    socket.on('leave', () => {
        const roomId = ourmap.get(socket.id); // Get the room ID
        if (roomId) {
            // Notify partner about leaving
            const partnerId = roomId.split('#').find(id => id !== socket.id);
            const partnerSocket = io.sockets.sockets.get(partnerId);
            partnerSocket.leave(roomId);
            ourmap.delete(partnerSocket.id);
            if (partnerSocket) {
                partnerSocket.emit('partnerleft', { message: 'Your partner has left the chat.' });
            }
            // Leave the room
            socket.leave(roomId);
            ourmap.delete(socket.id); // Remove the socket from the map
            
        }
    });
    socket.on('disconnect',()=>{
        const roomId = ourmap.get(socket.id); // Get the room ID
        if (roomId) {
            // Notify partner about leaving
            const partnerId = roomId.split('#').find(id => id !== socket.id);
            const partnerSocket = io.sockets.sockets.get(partnerId);
            partnerSocket.leave(roomId);
            ourmap.delete(partnerSocket.id);
            if (partnerSocket) {
                partnerSocket.emit('partnerleft', { message: 'Your partner has left the chat.' });
            }
            // Leave the room
            socket.leave(roomId);
            ourmap.delete(socket.id); // Remove the socket from the map
            
        }
    
    })
})
   

const PORT = process.env.port || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
