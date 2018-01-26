/* @flow */
import * as T from '../utils/types'

import * as actions from '../actions/tables'

const initialState = {
  fetching: false,
  scope: null,
  items: null
}

export default (state : T.TablesState, action : T.Action) : T.TablesState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.FETCH_SUCCESS: return fetchSuccess(state, action)
    case actions.FETCH_ERROR: return fetchError(state, action)
    case actions.TABLE_UPDATED: return tableUpdated(state, action)
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
  if (state.scope && scope.botId == state.scope.botId) {
    return {
      ...state,
      fetching: false,
      scope,
      items,
    }
  } else {
    return state
  }
}

const fetchError = (state, action) => {
  const {scope} = action
  if (state.scope && scope.botId == state.scope.botId) {
    return {
      ...state,
      fetching: false,
      scope,
      items: null,
    }
  } else {
    return state
  }
}

const tableUpdated = (state, action) => {
  const {table, botId} = action
  if (state.scope && state.scope.botId == botId) {
    return {
      ...state,
      items: {
        ...(state.items || {}),
        [table.id]: table
      }
    }
  } else {
    return state
  }
}
