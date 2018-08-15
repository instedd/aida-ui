/* @flow */
import * as T from '../utils/types'

import * as actions from '../actions/channels'
import * as channelActions from '../actions/channel'

const initialState = {
  fetching: false,
  creating: false,
  scope: null,
  items: null,
}

export default (state : T.ChannelsState, action : T.Action) : T.ChannelsState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.RECEIVE: return receive(state, action)
    case channelActions.UPDATE: return update(state, action)
    case actions.CREATE_SUCCESS: return createSuccess(state, action)
    case actions.CREATE: return create(state, action)
    case actions.CREATE_FAILURE: return createFailure(state, action)
    default: return state
  }
}

const create = (state, action) => {
  const { scope } = action
  return {
    ...state,
    creating: true,
    scope
  }
}

const createSuccess = (state, action) => {
  const {channel} = action
  return {
    ...state,
    creating: false,
    items: {
      ...state.items,
      ...{[channel.id]: channel}
    }
  }
}

const createFailure = (state, action) => {
  return {
    ...state,
    creating: false
  }
}

const receive = (state, action) => {
  const {scope, items} = action
  return {
    ...state,
    fetching: false,
    scope,
    items,
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

const update = (state, action) => {
  const {channel} = action

  return {
    ...state,
    items: {
      ...state.items,
      ...{[channel.id]: channel}
    }
  }
}
