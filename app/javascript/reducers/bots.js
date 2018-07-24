/* @flow */
import * as T from '../utils/types'
import omit from 'lodash/omit'

import * as actions from '../actions/bots'
import * as botActions from '../actions/bot'
import * as skillsActions from '../actions/skills'
import * as skillActions from '../actions/skill'
import * as chatActions from '../actions/chat'

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
    case botActions.PUBLISH_FAILURE: return pushErrors(state, action)
    case chatActions.START_PREVIEW_FAILURE: return pushErrors(state, action)
    case chatActions.START_PREVIEW_SUCCESS: return clearErrors(state, action)
    case skillsActions.REORDER: return clearErrors(state, action)
    case skillsActions.CREATE_SUCCESS: return clearErrors(state, action)
    case botActions.UNPUBLISH_SUCCESS: return unpublishSuccess(state, action)
    case skillActions.DELETE: return clearErrors(state, action)
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

const pushErrors = (state, action) => {
  return {
    ...state,
    errors: action.errors
  }
}

const clearErrors = (state, action) => {
  return {
    ...state,
    errors: null
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
      errors: null
    }
  } else {
    return state
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
