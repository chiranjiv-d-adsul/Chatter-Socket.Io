const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/message');
const {userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/user');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

// static folder
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'Chatter Bot';

// run when client connects
io.on('connection', socket => {
    socket.on('joinRoom' , ({ username, room}) =>{
        const user = userJoin(socket.id, username,room);

        socket.join(user.room);
        
        // when client is connected single client
    socket.emit('message' , formatMessage(botName,'Welcome to chatter!'));

    // when user is connect all of the client accept the client to the connecting
    socket.broadcast
    .to(user.room)
    .emit('message',
    formatMessage(botName,`A ${user.username} has joined the chat`)
    );
      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    });


    // listen for chat message
    socket.on('chatMessage', msg =>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message' ,  formatMessage(`${user.username}`,msg));
    });

    
    // io.emit all the client to connect
    socket.on('disconnect' , () =>{
        const user = userLeave(socket.id);
        if(user) {
            io.to(user.room).emit('message' , formatMessage(botName,`A ${user.username} has left the chat`));
        // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });    
        }
      
    });
});
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`server is connected at ${PORT}`));