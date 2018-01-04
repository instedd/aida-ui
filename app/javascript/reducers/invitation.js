// @flow
import * as T from '../utils/types'
import * as actions from '../actions/invitations'

const initialState = {
  fetching: false,
  token: null,
  invitation: null
}

export default (state : T.InvitationState, action : T.Action) : T.InvitationState => {
  state = state || initialState
  switch (action.type) {
    case actions.RETRIEVE: return retrieve(state, action)
    case actions.RETRIEVE_SUCCESS: return retrieveSuccess(state, action)
    case actions.RETRIEVE_ERROR: return retrieveError(state, action)
    default:
      return state
  }
}

const retrieve = (state, action) => {
  const { token } = action
  return {
    ...state,
    fetching: true,
    token,
    invitation: null
  }
}

const retrieveSuccess = (state, action) => {
  const { token, invitation } = action
  return {
    ...state,
    fetching: false,
    token,
    invitation
  }
}

const retrieveError = (state, action) => {
  const { token } = action
  return {
    ...state,
    fetching: false,
    token,
    invitation: null
  }
}
