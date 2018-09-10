/* @flow */
import * as T from '../utils/types'

import * as actions from '../actions/messages'
import omit from 'lodash/omit'

const initialState = {
  fetching: false,
  items: null,
}

export default (state: T.HumanOverrideMessagesState, action: T.Action): T.HumanOverrideMessagesState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.RECEIVE: return receive(state, action)
    case actions.ANSWER: return answer(state, action)
    default: return state
  }
}

const answer = (state, action) => {
  const { messageId, answer } = action
  const { items } = state

  if (items) {
    const message = { ...items[messageId.toString()] }
    message.data.messages = message.data.messages || []
    message.data.messages.push({ content: answer, direction: 'otu', type: 'text' })

    return {
      ...state,
      items: {
        ...state.items,
        ...{ [message.id]: message }
      }
    }
  }
  else {
    return state
  }
}

const receive = (state, action) => {
  const items = action.items
  return {
    ...state,
    fetching: false,
    items: items,
  }
}

const fetch = (state, action) => {
  return {
    ...state,
    fetching: true,
  }
}
