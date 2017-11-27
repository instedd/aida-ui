import * as actions from '../actions/frontDesk'

const initialState = {
  fetching: false,
  botId: null,
  data: {}
}

export default (state, action) => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetching(state, action)
    case actions.FETCH_SUCCESS: return fetchSuccess(state, action)
    case actions.FETCH_ERROR: return fetchError(state, action)
    case actions.UPDATE_CONFIG: return updateConfig(state, action)
    default:
      return state
  }
}

const fetching = (state, action) => {
  return {
    ...state,
    fetching: true,
    botId: action.botId
  }
}

const fetchSuccess = (state, action) => {
  return {
    ...state,
    fetching: false,
    data: action.data
  }
}

const fetchError = (state, action) => {
  return {
    ...state,
    fetching: false,
    data: {}
  }
}

const updateConfig = (state, action) => {
  return {
    ...state,
    data: {
      ...state.data,
      config: action.config
    }
  }
}
