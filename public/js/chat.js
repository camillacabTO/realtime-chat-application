const socket = io() // client connects to the server.
const template = $('#message-template').html()
const locationTemplate = $('#location-template').html()
const sidebarTemplate = $('#sidebar-template').html()

const { username, room } = Qs.parse(location.search, {
  //parse params from QS
  ignoreQueryPrefix: true,
})

const autoscroll = () => {
  const lastMessageHeight = $('#messages').children().last().outerHeight(true)
  const visibleMessagesHeight = $('#messages').outerHeight()
  const totalMessagesHeight = $('#messages').prop('scrollHeight')
  const scrollOffset = $('#messages').scrollTop() + visibleMessagesHeight // distance from the top minus container height
  if (totalMessagesHeight - lastMessageHeight <= scrollOffset) {
    $('#messages').scrollTop(totalMessagesHeight)
  }
}

socket.on('message', (msg) => {
  console.log(msg)
  const rendered = Mustache.render(template, {
    username: msg.username,
    msg: msg.text,
    createdAt: moment(msg.createdAt).format('h:mm a'),
    bgColor: msg.bgColor,
  }) // rendering messages with template
  $('#messages').append(rendered)
  autoscroll()
})

$('#messageForm').submit((e) => {
  e.preventDefault()
  $('#submit-form').prop('disabled', true) // disable send button

  const msg = e.target.elements.message.value
  socket.emit('sendMessage', msg, (confirmation) => {
    $('#submit-form').prop('disabled', false)
    $('#message').val('').focus() // clean input and add focus
    console.log(confirmation)
  }) // event acknowledgement from server
})

$('#shareLocation').click(() => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser!')
  }
  $('#shareLocation').prop('disable', true)
  navigator.geolocation.getCurrentPosition((location) => {
    const loc = {
      lat: location.coords.latitude,
      long: location.coords.longitude,
    }
    socket.emit('sendLocation', loc, (confirmation) => {
      $('#shareLocation').prop('disable', false)
      console.log(confirmation)
    })
  })
})

socket.on('locationMessage', (location) => {
  const rendered = Mustache.render(locationTemplate, {
    username: location.username,
    locationURL: location.url,
    createdAt: moment(location.createdAt).format('h:mm a'),
  })
  $('#messages').append(rendered)
})

socket.on('usersInRoom', ({ room, users }) => {
  const rendered = Mustache.render(sidebarTemplate, { room, users })
  $('#sidebar').html(rendered)
})

socket.emit('joinRoom', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/' // redirects
  }
}) // emit event to user joining an specific room
