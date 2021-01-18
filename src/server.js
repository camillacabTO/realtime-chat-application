const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const {
  generateMessage,
  generateLocationMessage
} = require('./utils/messages.js')
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users.js')

const PORT = process.env.PORT || 4000
const app = express()
const server = http.createServer(app)
const io = socketio(server) // it is expected to be called with the default http node server

io.on('connection', socket => {
  // socket contains info about the new connection. io listens and emits to all connections. socket emits only to a specific connection.
  console.log('New client connected')

  socket.on('joinRoom', ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room }) // add user to the array

    if (error) {
      return cb(error) // if there is an error, sends it back to the client as a acknowledgment
    }

    socket.join(user.room)

    socket.emit(
      'message',
      generateMessage('Admin', `Welcome to the ${user.room} room`)
    ) // send only to this user who just joined

    io.to(user.room).emit('usersInRoom', {
      // send a list of active users in the room to all users in that room
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    socket.broadcast
      .to(user.room)
      .emit('message', generateMessage(`${user.username} has joined`)) // to all but this user (in a specific room)

    cb() // with no error
  })

  socket.on('sendMessage', (msg, cb) => {
    // receive the msg from one client
    const user = getUser(socket.id)
    io.to(user.room).emit('message', generateMessage(user.username, msg)) // sends the same to all clients
    console.log(user.username)
    cb('Delivered') // event acknowledgement. confirmation of receipment
  })

  socket.on('sendLocation', ({ lat, long }, cb) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${lat},${long}`
      )
    )
    cb('Location Shared')
  })

  socket.on('disconnect', () => {
    // built in event.
    const user = removeUser(socket.id)

    if (user) {
      // if the user removed existed before
      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.username} has left!`)
      )

      io.to(user.room).emit('usersInRoom', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

app.use(express.static(path.join(__dirname, '../public')))

// app.get('/', (req, res) => {
//   res.render('index')
// })
server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})
