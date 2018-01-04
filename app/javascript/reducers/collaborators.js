/* @flow */
import * as T from '../utils/types'
import filter from 'lodash/filter'

import * as actions from '../actions/collaborators'
import * as invitationsActions from '../actions/invitations'

const initialState = {
  fetching: false,
  scope: null,
  data: null,
}

export default (state : T.CollaboratorsState, action : T.Action) : T.CollaboratorsState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.FETCH_SUCCESS: return fetchSuccess(state, action)
    case actions.INVITE_SUCCESS: return inviteSuccess(state, action)
    case invitationsActions.CANCEL: return cancelInvitation(state, action)
    case actions.REMOVE: return removeCollaborator(state, action)
    default: return state
  }
}

const fetch = (state, action) => {
  const {scope} = action
  return {
    ...state,
    fetching: true,
    scope,
    data: null,
  }
}

const fetchSuccess = (state, action) => {
  const {scope, data} = action
  if (!state.scope || state.scope.botId != scope.botId) {
    return state
  } else {
    return {
      ...state,
      fetching: false,
      scope,
      data,
    }
  }
}

const inviteSuccess = (state, action) => {
  const {botId, invitation} = action
  const {data} = state
  if (!state.scope || state.scope.botId != botId || !data) {
    return state
  } else {
    return {
      ...state,
      data: {
        ...data,
        invitations: [...data.invitations, invitation]
      }
    }
  }
}

const cancelInvitation = (state, action) => {
  const {invitation} = action
  const {data} = state
  if (data) {
    return {
      ...state,
      data: {
        ...data,
        invitations: filter(data.invitations, i => i.id != invitation.id)
      }
    }
  } else {
    return state
  }
}

const removeCollaborator = (state, action) => {
  const {collaborator} = action
  const {data} = state
  if (data) {
    return {
      ...state,
      data: {
        ...data,
        collaborators: filter(data.collaborators, c => c.id != collaborator.id)
      }
    }
  } else {
    return state
  }
}
