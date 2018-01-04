// @flow
import * as T from '../utils/types'

import * as actions from '../actions/chat'

const initialState = {
  scope: {},
  messages: []
}

export default (state : T.ChatState, action : T.ChatAction) : T.ChatState => {
  state = state || initialState
  switch (action.type) {
    case actions.START_PREVIEW: return startPreview(state, action)
    case actions.SEND_MESSAGE: return sendMessage(state, action)
    case actions.RECEIVE_MESSAGE: return receiveMessage(state, action)
    default:
      return state;
  }
}

const startPreview = (state, action) => {
  if (state.scope.botId != action.botId) {
    state = {
      scope: { botId: action.botId },
      messages:[]
    }
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
