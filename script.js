import localforage from 'https://unpkg.com/localforage@1.7.3/src/localforage.js'

const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const nameContainer = document.getElementById('name-container')
const usersContainer = document.getElementById('users-container')
const messageForm = document.getElementById('send-container')
const deleteHistoryButton = document.getElementById('delete-button')
const messageInput = document.getElementById('message-input')
const userNameHtml = document.getElementById('user-name')

let userName = null
let isUserActive = null
let activeUsers = []
let localMessages = []

// Get History
const getUserHistory = async () => {
  // User Name
  userName = localStorage.getItem('userName');
  // Chat History
  await localforage.getItem('messages').then((value) => {
    if (!value) {
      console.log('No History');
      return
    }
    localMessages = value
  })
}
// User Activity
const inactiveUserReConnect = () => {
  alert('Still there?');
  location.reload();
}
// Reset User Activity
const resetUserActivityTimeout = () => {
  clearTimeout(isUserActive);
  isUserActive = setTimeout(() => {
    inactiveUserReConnect();
  }, 120000);
}
// Set User Name 
const isLoggedIn = () => {
  if (!userName) {
    userName = prompt('What is your name?')
    if (!userName == "" && userName !== 'null') {
      localStorage.setItem('userName', userName);
    }
    isLoggedIn()
  }
}
// Messages Handler
const messageHandler = async (msg) => {
  localMessages.push(msg)
  localforage.setItem('messages', localMessages).then(renderMessages());
}
// Render Messages
const renderMessages = async () => {
  messageContainer.innerHTML = '';
  usersContainer.innerHTML = '';
  // Messages
  localMessages && localMessages.forEach(message => {
    const messageElement = document.createElement('div')
    messageElement.className = "message";
    messageElement.innerText = message
    messageContainer.append(messageElement)
  });
  // Users
  if (!activeUsers.length) {
    const userElement = document.createElement('div')
    userElement.className = "users-title";
    userElement.innerText = "No Users Online"
    usersContainer.append(userElement)
  }
  activeUsers.forEach(user => {
    const userElement = document.createElement('div')
    userElement.className = "users-title";
    userElement.innerText = user
    usersContainer.append(userElement)
  })
}
await getUserHistory()
isLoggedIn()
renderMessages()
// Display New User
const messageElement = document.createElement('div')
userNameHtml.innerText = `Welcome! ${userName}`
messageElement.className = "message";
messageElement.innerText = `You (${userName}) joined`
nameContainer.append(messageElement)
// Socket
// Emit User Name
socket.emit('new-user', userName)
socket.emit('connected', userName)
// Connected
socket.on('connected', users => {
  activeUsers = []
  for (const property in users.users) {
    activeUsers.push(`${users.users[property]}`);
  }
})
// Socket Message
socket.on('chat-message', data => {
  messageHandler(`${data.name}: ${data.message}`)
})
// Socket Connect
socket.on('user-connected', userName => {
  activeUsers = []
  for (const property in userName.users) {
    activeUsers.push(`${userName.users[property]}`);
  }
  messageHandler(`${userName.name} connected`)
})
// Socket Disconnect
socket.on('user-disconnected', userName => {
  activeUsers = []
  for (const property in userName.users) {
    activeUsers.push(`${userName.users[property]}`);
  }
  messageHandler(`${userName.name} disconnected`)
})
// Send Message Button
messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  messageHandler(`You: ${message}`)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})
// Delete History Button
deleteHistoryButton.addEventListener('submit', e => {
  alert('Messages will be deleted only for this device')
  localforage.clear()
})
// User activity
resetUserActivityTimeout()
window.addEventListener("mousemove", resetUserActivityTimeout);
window.addEventListener("scroll", resetUserActivityTimeout);
window.addEventListener("keydown", resetUserActivityTimeout);
window.addEventListener("resize", resetUserActivityTimeout);

