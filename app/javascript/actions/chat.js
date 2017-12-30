// @flow
import * as T from '../utils/types'

export const START_PREVIEW = 'START_PREVIEW'
export const SEND_MESSAGE = 'SEND_MESSAGE'
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE'

// Action Creator
let nextMessageId = 1;
export const sendMessage = (text : string) : T.ChatAction => ({
  type: SEND_MESSAGE,
  id: nextMessageId++,
  text,
  sent: true,
  timestamp: new Date()
})

export const receiveMessage = (text: string) : T.ChatAction => ({
  type: RECEIVE_MESSAGE,
  id: nextMessageId++,
  text,
  sent: false,
  timestamp: new Date()
})

export const startPreview = (botId: number) : T.ChatAction => ({
  type: START_PREVIEW,
  botId: botId
})
