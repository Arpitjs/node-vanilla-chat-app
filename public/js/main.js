const chatForm = document.querySelector('#chat-form')
const chatMessages = document.querySelector('.chat-messages')
const socket = io()
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})
//join chatroom
socket.emit('joinRoom', { username, room })

//get room and users
socket.on('roomUsers', data => {
    outputRoomName(data.room)
    outputUsers(data.users)
})

socket.on('message', message => {
    console.log(message)
    outputMessage(message)
    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//message submit
chatForm.addEventListener('submit', e => {
    e.preventDefault()
    const msg = chatForm.msg.value
    socket.emit('chatMessage', msg)
    //clear input
    chatForm.msg.value = ''
})

function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>
    `
    document.querySelector('.chat-messages').appendChild(div)
}

//add room name to DOM
function outputRoomName(name) {
    const roomName = document.querySelector('#room-name')
    roomName.textContent = name
}
//add users to DOM
function outputUsers(users) {
    const usersList = document.querySelector('#users')
    usersList.innerHTML = users.map(user => `<li>${user.username}</li>`).join('')
}