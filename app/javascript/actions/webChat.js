// @flow
import * as T from '../utils/types'

export const SEND_MESSAGE = 'WEB_CHAT_SEND_MESSAGE'
export const RECEIVE_MESSAGE = 'WEB_CHAT_RECEIVE_MESSAGE'
export const SEND_ATTACHMENT_SUCCESS = 'WEB_CHAT_SEND_ATTACHMENT_SUCCESS'
export const CONNECTED = 'WEB_CHAT_CONNECTED'
export const DISCONNECTED = 'WEB_CHAT_DISCONNECTED'

// Action Creator
let nextMessageId = 1;
export const sendMessage = (text : string) : T.WebChatAction => ({
  type: SEND_MESSAGE,
  id: nextMessageId++,
  text,
  sent: true,
  timestamp: new Date()
})

export const receiveMessage = (text: string) : T.WebChatAction => ({
  type: RECEIVE_MESSAGE,
  id: nextMessageId++,
  text,
  sent: false,
  timestamp: new Date()
})

export const attachmentSent = (attachment : string) : T.WebChatAction => ({
  type: SEND_ATTACHMENT_SUCCESS,
  id: nextMessageId++,
  attachment,
  sent: true,
  timestamp: new Date()
})

export const chatConnected = (botId : string) => ({
  type: CONNECTED,
  botId
})

export const chatDisconnected = (botId : string) => ({
  type: DISCONNECTED,
  botId
})
