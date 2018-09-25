// @flow
import * as T from '../utils/types'

import * as actions from '../actions/webChat'

const initialState = {
  messages: [],
  botId: null,
  accessToken: "",
  connected: false,
  sessionId: null,
}

export default (state : T.WebChatState, action : T.WebChatAction) : T.WebChatState => {
  state = state || initialState
  switch (action.type) {
    case actions.SEND_MESSAGE: return addMessage(state, action)
    case actions.RECEIVE_MESSAGE: return addMessage(state, action)
    case actions.SEND_ATTACHMENT_SUCCESS: return addMessage(state, action)
    case actions.CONNECTED: return chatConnected(state, action)
    case actions.DISCONNECTED: return chatDisconnected(state, action)
    default:
      return state;
  }
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
  if (action.botId == state.botId) {
    return {
      ...state,
      connected: true
    }
  } else {
    return state
  }
}

const chatDisconnected = (state, action) => {
  if (action.botId == state.botId) {
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
