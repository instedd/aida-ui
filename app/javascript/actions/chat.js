// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

import { pushNotification } from './notifications'

import uuidv4 from 'uuid/v4'

export const START_PREVIEW = 'START_PREVIEW'
export const START_PREVIEW_SUCCESS = 'START_PREVIEW_SUCCESS'
export const START_PREVIEW_FAILURE = 'START_PREVIEW_FAILURE'
export const SEND_MESSAGE = 'SEND_MESSAGE'
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE'
export const SEND_ATTACHMENT_SUCCESS = 'SEND_ATTACHMENT_SUCCESS'
export const PAUSE_PREVIEW = 'PAUSE_PREVIEW'
export const NEW_SESSION = 'NEW_SESSION'
export const CONNECTED = 'CHAT_CONNECTED'
export const DISCONNECTED = 'CHAT_DISCONNECTED'

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

export const attachmentSent = (attachment : string) : T.ChatAction => ({
  type: SEND_ATTACHMENT_SUCCESS,
  id: nextMessageId++,
  attachment,
  sent: true,
  timestamp: new Date()
})

export const _startPreview = (botId: number, accessToken: string) : T.ChatAction => ({
  type: START_PREVIEW,
  botId,
  accessToken,
})

export const _startPreviewSuccess = (botId: number, previewUuid: string, sessionId: string, accessToken: string) : T.ChatAction => ({
  type: START_PREVIEW_SUCCESS,
  botId,
  previewUuid,
  sessionId,
  accessToken,
  errors: null
})

export const _startPreviewFailure = (botId : number, errors: any) : T.ChatAction => ({
  type: START_PREVIEW_FAILURE,
  botId,
  errors
})

export const updatePreviewIfActive = () => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()
  if (state.chat.scope && state.chat.scope.botId && !state.chat.pausePreview && state.bots.items) {
    const bot = state.bots.items[state.chat.scope.botId.toString()]
    if (bot) {
      dispatch(startPreview(bot))
    }
  }
}

export const startPreview = (bot: T.Bot) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  let accessToken = ""

  if (state.chat.scope && state.chat.scope.botId == bot.id) {
    // if the bot to preview is the same as before,
    // better keep the access token
    accessToken = state.chat.accessToken
  } else {
    // otherwise we need a new random access token
    accessToken = uuidv4()
  }

  dispatch(_startPreview(bot.id, accessToken))

  api.previewBot(bot, accessToken)
    .then((result) => {
      dispatch(_startPreviewSuccess(bot.id, result.preview_uuid, result.session_uuid, accessToken))
    })
    .catch((error) => {
      dispatch(pushNotification('Bot preview failed'))
      error.json().then((json_error) => {
        dispatch(_startPreviewFailure(bot.id, json_error.result))
      })
    })
}

export const pausePreview = (bot : T.Bot) : T.ChatAction => ({
  type: PAUSE_PREVIEW,
  botId: bot.id,
})

export const newSession = (bot : T.Bot, sessionId: string) : T.ChatAction => ({
  type: NEW_SESSION,
  botId: bot.id,
  sessionId,
})

export const chatConnected = (previewUuid : string) => ({
  type: CONNECTED,
  previewUuid
})

export const chatDisconnected = (previewUuid : string) => ({
  type: DISCONNECTED,
  previewUuid
})
