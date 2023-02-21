const users = []

const addUser = ({ id, username, room, radColor }) => {
  // return an user obj or error obj
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  if (!username || !room) {
    return {
      error: 'Username and room are required',
    }
  }
  const doesUserExist = users.find((user) => {
    // return undefined if not found. Stops when finds it
    return user.room === room && user.username === username
  })

  if (doesUserExist) {
    return {
      error: 'Username already taken!',
    }
  }

  const user = { id, username, room, radColor }
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id) // returns index if found, -1 if not found

  if (index !== -1) {
    return users.splice(index, 1)[0] // returns an array of spliced items. [0] to get only element in array
  }
}

const getUser = (id) => {
  return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
}
