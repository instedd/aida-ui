/* @flow */
import * as T from '../utils/types'

import * as actions from '../actions/auth'

const initialState = {
  userEmail: null,
  userName: null
}

export default (state : T.AuthState, action : T.Action) : T.AuthState => {
  state = state || initialState
  switch (action.type) {
    case actions.INIT: return init(state, action)
    default: return state
  }
}

const init = (state, action) => {
  return {
    ...state,
    userEmail: action.userEmail,
    userName: action.userName
  }
}
