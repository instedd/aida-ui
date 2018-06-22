// @flow
import * as T from '../utils/types'

import * as actions from '../actions/chat'

const initialState = {
  scope: {},
  messages: [],
  previewUuid: null,
  accessToken: "",
  publishing: false,
  connected: false,
  previewPaused: false,
  sessionId: null,
}

export default (state : T.ChatState, action : T.ChatAction) : T.ChatState => {
  state = state || initialState
  switch (action.type) {
    case actions.START_PREVIEW: return startPreview(state, action)
    case actions.START_PREVIEW_SUCCESS: return startPreviewSuccess(state, action)
    case actions.SEND_MESSAGE: return sendMessage(state, action)
    case actions.RECEIVE_MESSAGE: return receiveMessage(state, action)
    case actions.SEND_ATTACHMENT_SUCCESS: return attachmentSent(state, action)
    case actions.PAUSE_PREVIEW: return pausePreview(state, action)
    case actions.NEW_SESSION: return newSession(state, action)
    case actions.CONNECTED: return chatConnected(state, action)
    case actions.DISCONNECTED: return chatDisconnected(state, action)
    default:
      return state;
  }
}

const startPreview = (state, action) => {
  const {botId, accessToken} = action

  if (state.scope.botId != botId) {
    state = {
      scope: { botId },
      messages:[],
      publishing: true,
      pausePreview: false,
      previewUuid: null,
      accessToken,
      connected: false,
      sessionId: null,
    }
  } else {
    state = {...state, publishing: true, pausePreview: false, accessToken}
  }

  return state
}

const startPreviewSuccess = (state, action) => {
  const {botId, previewUuid, sessionId, accessToken} = action

  if (state.scope.botId != botId) {
    state = {
      scope: { botId },
      messages:[],
      publishing: false,
      pausePreview: false,
      previewUuid,
      accessToken,
      sessionId,
    }
  } else {
    // if the bot to preview is the same as before,
    // better keep the messages
    state = {...state, publishing: false, pausePreview: false, previewUuid, sessionId, accessToken}
  }

  return state
}

const pausePreview = (state, action) => {
  const {botId} = action

  if (state.scope.botId == botId) {
    state = {...state, pausePreview: true}
  }

  return state
}

const newSession = (state, action) => {
  const {botId, sessionId} = action

  if (state.scope.botId == botId) {
    state = {...state, sessionId, messages: []}
  }

  return state
}

const sendMessage = (state, action) => {
  return addMessage(state, action)
}

const attachmentSent = (state, action) => {
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

const chatConnected = (state, action) => {
  if (action.previewUuid == state.previewUuid) {
    return {
      ...state,
      connected: true
    }
  } else {
    return state
  }
}

const chatDisconnected = (state, action) => {
  if (action.previewUuid == state.previewUuid) {
    return {
      ...state,
      connected: false
    }
  } else {
    return state
  }
}

// TODO: the object that will be received is one of both actions: 'SEND_ATTACHMENT_SUCCESS', or 'SEND_MESSAGE'/'RECEIVE_MESSAGE'
// So you have a `text` property, or an `attachment` one. I couldn't find a way to state that to flow, so that's why we have an
// `any` here as a type. That Works™
const createMessageWith = ({ id, text, attachment, sent, timestamp } : any) => ({ id, text, attachment, sent, timestamp})
