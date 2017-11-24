/* @flow */
import * as T from '../utils/types'

import * as actions from '../actions/notifications'

const initialState = {
  toasts: []
}

export default (state : T.NotifState, action : T.Action) : T.NotifState => {
  state = state || initialState
  switch (action.type) {
    case actions.PUSH: return push(state, action)
    case actions.DISMISS: return dismiss(state, action)
    default: return state
  }
}

const push = (state, action) => {
  const toasts = state.toasts.slice()
  toasts.push({text: action.message, action: null})
  return {
    ...state,
    toasts
  }
}

const dismiss = (state, action) => {
  const [, ...toasts] = state.toasts
  return {
    ...state,
    toasts
  }
}
