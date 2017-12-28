export const START_PREVIEW = 'START_PREVIEW'
export const SEND_MESSAGE = 'SEND_MESSAGE'
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE'

// Action Creator
let nextMessageId = 1;
export const sendMessage = (text) => {
  return {
    type: SEND_MESSAGE,
    id: nextMessageId++,
    text,
    sent: true,
    timestamp: new Date()
  }
}

export const receiveMessage = (text) => {
  return {
    type: RECEIVE_MESSAGE,
    id: nextMessageId++,
    text,
    sent: false,
    timestamp: new Date()
  }
}

export const startPreview = (botId) => {
  return {
    type: START_PREVIEW,
    botId: botId
  }
}
