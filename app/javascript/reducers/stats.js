// @flow
import * as T from '../utils/types'
import * as actions from '../actions/stats'

const initialState = {
  fetching: false,
  botId: null,
  period: null,
  data: null
}

export default (state : T.StatsState, action : T.StatsAction) : T.StatsState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetching(state, action)
    case actions.FETCH_SUCCESS: return fetchSuccess(state, action)
    case actions.FETCH_ERROR: return fetchError(state, action)
    default:
      return state
  }
}

const fetching = (state, action) => {
  return {
    ...state,
    fetching: true,
    botId: action.botId,
    period: action.period,
  }
}

const fetchSuccess = (state, action) => {
  if (state.botId == action.botId && state.period == action.period) {
    return {
      ...state,
      fetching: false,
      data: action.data
    }
  } else {
    return state
  }
}

const fetchError = (state, action) => {
  if (state.botId == action.botId && state.period == action.period) {
    return {
      ...state,
      fetching: false,
      data: null
    }
  } else {
    return state
  }
}
