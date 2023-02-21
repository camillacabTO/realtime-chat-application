const generateMessage = (username, text, bgColor = '#16c79a') => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
    bgColor,
  }
}

const generateLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  }
}

module.exports = { generateMessage, generateLocationMessage }
