/* @flow */
import * as T from '../utils/types'
import omit from 'lodash/omit'

import * as actions from '../actions/bots'
import * as botActions from '../actions/bot'

const initialState = {
  fetching: false,
  items: null,
}

export default (state : T.BotsState, action : T.Action) : T.BotsState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.RECEIVE: return receive(state, action)
    case actions.CREATE_SUCCESS: return createSuccess(state, action)
    case botActions.UPDATE: return update(state, action)
    case botActions.DELETE: return deleteBot(state, action)
    case botActions.PUBLISH_SUCCESS: return publishSuccess(state, action)
    case botActions.PUBLISH_FAILURE: return publishFailure(state, action)
    case botActions.UNPUBLISH_SUCCESS: return unpublishSuccess(state, action)
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

const deleteBot = (state, action) => {
  const {botId} = action

  return {
    ...state,
    items: omit(state.items, [botId])
  }
}

const createSuccess = (state, action) => {
  const {bot} = action
  return {
    ...state,
    items: {
      ...state.items,
      ...{[bot.id]: bot}
    }
  }
}

const publishSuccess = (state, action) => {
  const {botId} = action
  const bot = state.items && state.items[botId.toString()]
  if (bot) {
    return {
      ...state,
      items: {
        ...state.items,
        ...{[botId]: {...bot, published: true}}
      },
      ...{errors: null}
    }
  } else {
    return state
  }
}

const publishFailure = (state, action) => {
  const botId = action.botId
  const bot = state.items && state.items[botId.toString()]
  const errors = action.errors
  return {
    ...state,
    items: {
      ...state.items,
      ...{[botId]: bot}
    },
    ...{errors: errors}
  }
}

const unpublishSuccess = (state, action) => {
  const {botId} = action
  const bot = state.items && state.items[botId.toString()]
  if (bot) {
    return {
      ...state,
      items: {
        ...state.items,
        ...{[botId]: {...bot, published: false}}
      }
    }
  } else {
    return state
  }
}
