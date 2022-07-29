const io = require('socket.io')(3000)
const users = {}
io.on('connection', socket => {
  socket.on('connected', name => {
    console.log(users);
    socket.broadcast.emit('connected', { name, users })
  })
  socket.on('new-user', name => {
    users[socket.id] = name
    socket.broadcast.emit('user-connected', { name, users })
  })
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', { name: users[socket.id], users })
    delete users[socket.id]
  })
})