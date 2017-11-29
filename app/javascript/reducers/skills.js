/* @flow */
import * as T from '../utils/types'

import * as actions from '../actions/skills'
import * as skillActions from '../actions/skill'

const initialState = {
  fetching: false,
  scope: null,
  items: null,
  creating: null
}

export default (state : T.SkillsState, action : T.Action) : T.SkillsState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.RECEIVE: return receive(state, action)
    case actions.CREATE: return create(state, action)
    case actions.CREATE_SUCCESS: return createSuccess(state, action)
    case actions.CREATE_ERROR: return createError(state, action)
    case skillActions.UPDATE: return update(state, action)
    default: return state
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
  const {skill} = action

  return {
    ...state,
    items: {
      ...state.items,
      ...{[skill.id]: skill}
    }
  }
}

const create = (state, action) => {
  if (action.scope.botId == state.scope.botId) {
    return {
      ...state,
      creating: action.skillKind
    }
  } else {
    return state
  }
}

const createSuccess = (state, action) => {
  if (action.scope.botId == state.scope.botId) {
    const {skill} = action
    return {
      ...state,
      items: {
        ...state.items,
        ...{[skill.id]: skill}
      },
      creating: null
    }
  } else {
    return state
  }
}

const createError = (state, action) => {
  if (action.scope.botId == state.scope.botId) {
    const {skill} = action
    return {
      ...state,
      creating: null
    }
  } else {
    return state
  }
}
