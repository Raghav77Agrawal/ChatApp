require('dotenv').config()
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const UserRouter = require('./controller/users');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));
app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.mongourl,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Database connection error:', err));

// Middleware and Routes
app.use('/m', UserRouter);
app.get('/', (req, res) => {
    return res.sendFile(__dirname + '/public/index.html');
});
const ourmap = new Map();
let queue = [];
io.on('connection' , (socket)=>{
   
    socket.on('findPartner' , ()=>{
        console.log('a user connected: ', socket.id);
        if(queue.includes(socket.id)){
            socket.emit('Already exist');
        }
        else if(queue.length>0){
            const partnerid = queue.shift();
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
console.log(`${socket.id} and ${partnerSocket.id} are connected in ${roomid}`);

            }
            else{
                queue.push(socket.id);
                socket.emit('Finding');
            }
        }
        else{
            queue.push(socket.id);
            console.log('user connected', socket.id);
            socket.emit('Finding');
        }
    })
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
            console.log(`${socket.id} has left the room ${roomId}`);
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
            console.log(`${socket.id} has left the room ${roomId}`);
        }
    
    })
})
   

const PORT = process.env.port || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
