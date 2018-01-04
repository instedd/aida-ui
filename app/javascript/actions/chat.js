// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

import { pushNotification } from './notifications'

import uuidv4 from 'uuid/v4'

export const START_PREVIEW = 'START_PREVIEW'
export const START_PREVIEW_SUCCESS = 'START_PREVIEW_SUCCESS'
export const SEND_MESSAGE = 'SEND_MESSAGE'
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE'
export const PAUSE_PREVIEW = 'PAUSE_PREVIEW'
export const NEW_SESSION = 'NEW_SESSION'

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

export const _startPreview = (botId: number, previewUuid: ?string, accessToken: string) : T.ChatAction => ({
  type: START_PREVIEW,
  botId,
  previewUuid,
  accessToken,
})

export const _startPreviewSuccess = (botId: number, previewUuid: string, accessToken: string) : T.ChatAction => ({
  type: START_PREVIEW_SUCCESS,
  botId,
  previewUuid,
  accessToken,
})

export const updatePreviewIfActive = () => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()
  if (state.chat.scope && state.chat.scope.botId && !state.chat.pausePreview && state.bots.items) {
    const bot = state.bots.items[state.chat.scope.botId.toString()]
    if (bot) {
      console.log("updating preview...")
      dispatch(startPreview(bot))
    }
  }
}

export const startPreview = (bot: T.Bot) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  let previewUuid = null
  let accessToken = ""

  if (state.chat.scope && state.chat.scope.botId == bot.id) {
    // if the bot to preview is the same as before,
    // better keep the backend bot instance (and the access token)
    previewUuid = state.chat.previewUuid
    accessToken = state.chat.accessToken
  } else {
    // otherwise we need a new backend bot (and new random access token)
    previewUuid = null
    accessToken = uuidv4()
  }

  dispatch(_startPreview(bot.id, previewUuid, accessToken))

  // TODO if previewing of different bot, we could unpublish the preview of state.chat.previewUuid

  api.previewBot(bot, previewUuid, accessToken)
    .then((result) => {
      dispatch(_startPreviewSuccess(bot.id, result.preview_uuid, accessToken))
    })
    .catch(() => dispatch(pushNotification('Bot preview failed')))
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
