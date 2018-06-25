/* @flow */
import * as T from '../utils/types'
import filter from 'lodash/filter'
import map from 'lodash/map'

import * as actions from '../actions/errorLogs'
import * as invitationsActions from '../actions/invitations'

const initialState = {
  fetching: false,
  scope: null,
  items: null,
}

export default (state : T.ErrorLogsState, action : T.Action) : T.ErrorLogsState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.FETCH_SUCCESS: return fetchSuccess(state, action)
    default: return state
  }
}

const fetch = (state, action) => {
  const {scope} = action
  return {
    ...state,
    fetching: true,
    scope,
    items: null,
  }
}

const fetchSuccess = (state, action) => {
  const {scope, items} = action
  if (!state.scope || state.scope.botId != scope.botId) {
    return state
  } else {
    return {
      ...state,
      fetching: false,
      scope,
      items,
    }
  }
}
