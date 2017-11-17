import * as actions from '../actions/bots'
import * as botActions from '../actions/bot'

const initialState = {
  fetching: false,
  items: null,
}

export default (state, action) => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.RECEIVE: return receive(state, action)
    case botActions.UPDATE: return update(state, action)
    default: return state
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

const update = (state, action) => {
  const {bot} = action

  return {
    ...state,
    items: {
      ...state.items,
      ...{[bot.id]: bot}
    }
  }
}
