const express = require('express')
const app = express()
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { getCurrentUser, userJoin, roomUsers, userLeave } = require('./utils/users')

const server = http.createServer(app)
const io = socketio(server)
const botName = 'ChatCord Bot'
//static files
app.use(express.static(path.join(__dirname, 'public')))

//run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', data => {
        const user = userJoin(socket.id, data.username, data.room)
        socket.join(user.room)
        socket.emit('message', formatMessage(botName, 'Welcome to Chat Cord.'))
        //broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined a chat.`))
          //send users and room info
          io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: roomUsers(user.room)
        })
    })

    //   listen for chat message
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        // console.log('CURENT USER', user)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    //broadcast when a user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        console.log('USER IN DISCONNECT', user)
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat.`))
            //send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: roomUsers(user.room)
            })
        }
    })
})

server.listen(4200, () => console.log('server is ready!!'))