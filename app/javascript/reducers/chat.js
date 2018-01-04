// @flow
import * as T from '../utils/types'

import * as actions from '../actions/chat'

const initialState = {
  scope: {},
  messages: [],
  previewUuid: null,
  accessToken: "",
  publishing: false,
  previewPaused: false,
}

export default (state : T.ChatState, action : T.ChatAction) : T.ChatState => {
  state = state || initialState
  switch (action.type) {
    case actions.START_PREVIEW: return startPreview(state, action)
    case actions.START_PREVIEW_SUCCESS: return startPreviewSuccess(state, action)
    case actions.SEND_MESSAGE: return sendMessage(state, action)
    case actions.RECEIVE_MESSAGE: return receiveMessage(state, action)
    case actions.PAUSE_PREVIEW: return pausePreview(state, action)
    case actions.NEW_SESSION: return newSession(state, action)
    default:
      return state;
  }
}

const startPreview = (state, action) => {
  const {botId, previewUuid, accessToken} = action

  if (state.scope.botId != botId || state.previewUuid != previewUuid) {
    state = {
      scope: { botId },
      messages:[],
      publishing: true,
      pausePreview: false,
      previewUuid,
      accessToken
    }
  } else {
    state = {...state, publishing: true, pausePreview: false, previewUuid, accessToken}
  }

  return state
}

const startPreviewSuccess = (state, action) => {
  const {botId, previewUuid, accessToken} = action

  if (state.scope.botId != botId || state.previewUuid != previewUuid) {
    state = {
      scope: { botId },
      messages:[],
      publishing: false,
      pausePreview: false,
      previewUuid,
      accessToken
    }
  } else {
    // if the bot to preview is the same as before,
    // better keep the messages
    state = {...state, publishing: false, pausePreview: false, previewUuid, accessToken}
  }

  return state
}

const pausePreview = (state, action) => {
  console.log("pausePreview")
  const {botId} = action

  if (state.scope.botId == botId) {
    state = {...state, pausePreview: true}
  }

  return state
}

const newSession = (state, action) => {
  const {botId} = action

  if (state.scope.botId == botId) {
    state = {...state, messages: []}
  }

  return state
}

const sendMessage = (state, action) => {
  return addMessage(state, action)
}

const receiveMessage = (state, action) => {
  return addMessage(state, action)
}

const addMessage = (state, action) => {
  return {
    ...state,
    messages: [
      ...state.messages,
      createMessageWith(action),
    ]
  }
}

const createMessageWith = ({ id, text, sent, timestamp }) => ({ id, text, sent, timestamp})
