require('dotenv').config()
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Userji = require('./model/users');
const UserRouter = require('./controller/users');
const ratelimit = require('express-rate-limit');
const app = express();
const cookieparser = require('cookie-parser');
const cors = require('cors');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://frontendchat-lemon.vercel.app/",
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const limiter = ratelimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
});




//mongodb connection

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Database connection error:', err));

// Middleware and Routes
app.use(express.json());
app.use(cookieparser());
app.use(express.urlencoded({ extended: false }))
app.use(cors({
    origin: "https://frontendchat-lemon.vercel.app/",
    methods: ['GET', 'POST'],
    credentials: true, //for cookies authentication
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/m',limiter, UserRouter);

//ourmap used for mapping socket.id with roomid
const ourmap = new Map();
//queue to add active sockets finding for random partner
let queue = [];
const socketUserMap = new Map();


//connection build sockets
io.on('connection', (socket) => {
    //search for partner in queue

    socket.on('init', (userId) => {
        socketUserMap.set(socket.id, userId);
    });
    socket.on('findPartner', () => {


        if (queue.includes(socket.id)) {
            socket.emit('Already exist');
        }
        else if (queue.length > 0) {

            const partnerid = queue.shift();
            //removing partner from queue as connection is build
            const partnerSocket = io.sockets.sockets.get(partnerid);
            if (partnerSocket) {
                queue = queue.filter(id => (id !== socket.id && id !== partnerid));
                const roomid = `${socket.id}#${partnerid}`;
                ourmap.set(socket.id, roomid);
                ourmap.set(partnerid, roomid);
                socket.join(roomid);
                partnerSocket.join(roomid);
                socket.emit('partnerfound', roomid);
                partnerSocket.emit('partnerfound', roomid);

            }
            else {
                queue.push(socket.id);
                socket.emit('Finding');
            }
        }
        else {
            queue.push(socket.id);

            socket.emit('Finding');
        }
    })
    //Sending msg to partner user
    socket.on('message', (message) => {
        socket.to(ourmap.get(socket.id)).emit('mymessage', { msg: message, sender: socket.id });
    })
    socket.on('typing', () => {
        socket.to(ourmap.get(socket.id)).emit('partnerTyping');
    });

    socket.on('stopTyping', () => {
        socket.to(ourmap.get(socket.id)).emit('partnerStopTyping');
    });
    socket.on('voice', (audioBlob) => {
        socket.to(ourmap.get(socket.id)).emit('voice', audioBlob);
    });
    socket.on('file', ({ name, type, buffer }) => {
        const realBuffer = Buffer.from(buffer);
        socket.to(ourmap.get(socket.id)).emit('file', { name, type, buffer: realBuffer });
    });
    socket.on('partnerinfo', (user) => {
        socket.to(ourmap.get(socket.id)).emit('partnerinfo', user);
    })

    socket.on('leave', () => {
        const roomId = ourmap.get(socket.id); // Get the room ID
        if (roomId) {
            // Notify partner about leaving
            const partnerId = roomId.split('#').find(id => id !== socket.id);
            const partnerSocket = io.sockets.sockets.get(partnerId);
     
            if (partnerSocket) {
                       partnerSocket.leave(roomId);
            ourmap.delete(partnerSocket.id);
                partnerSocket.emit('partnerleft', { message: 'Your partner has left the chat.' });
            }
            // Leave the room
            socket.leave(roomId);
            ourmap.delete(socket.id); // Remove the socket from the map

        }
    });
    socket.on('logout', async (user) => {
        try {
            await Userji.findByIdAndDelete(user._id);
        } catch (err) {
            console.error(`Failed to delete user ${user._id}:`, err);
        }
    })
    socket.on('disconnect', async () => {
        const roomId = ourmap.get(socket.id); // Get the room ID
        const userId = socketUserMap.get(socket.id);
        if (userId) {
            try {
                await Userji.findByIdAndDelete(userId);
            } catch (err) {
                console.error(`Failed to delete user ${userId}:`, err);
            }
            socketUserMap.delete(socket.id);
        }

        if (roomId) {
            // Notify partner about leaving
            const partnerId = roomId.split('#').find(id => id !== socket.id);
            const partnerSocket = io.sockets.sockets.get(partnerId);
         
            if (partnerSocket) {
                   partnerSocket.leave(roomId);
            ourmap.delete(partnerSocket.id);
                partnerSocket.emit('partnerleft', { message: 'Your partner has left the chat.' });
            }
            // Leave the room
            socket.leave(roomId);
            ourmap.delete(socket.id); // Remove the socket from the map

        }

    })
})


const PORT = process.env.port || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
