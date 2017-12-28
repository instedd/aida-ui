// @flow
import * as T from '../utils/types'
import * as actions from '../actions/chat'

const initialState = {
  scope: {},
  messages: []
}

export default (state, action) => {
  state = state || initialState
  switch (action.type) {
    case actions.START_PREVIEW: return startPreview(state, action)
    case actions.SEND_MESSAGE: return sendMessage(state, action)
    case actions.SEND_MESSAGE: return receiveMessage(state, action)
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
      createTestResponse(action)
    ]
  } 
}

const createMessageWith = ({ id, text, sent, timestamp }) => ({ id, text, sent, timestamp})
const createTestResponse = ({ id, text, sent, timestamp }) => ({ 
    id: (-1) * id, 
    text: text.split("").reverse().join(""), 
    sent: !sent, 
    timestamp 
})
