/* @flow */
import * as T from '../utils/types'

import * as actions from '../actions/skills'
import * as skillActions from '../actions/skill'

const initialState = {
  fetching: false,
  scope: null,
  items: null
}

export default (state : T.SkillsState, action : T.Action) : T.SkillsState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.RECEIVE: return receive(state, action)
    case actions.CREATE_SUCCESS: return createSuccess(state, action)
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

const createSuccess = (state, action) => {
  if (state.scope && action.scope.botId == state.scope.botId) {
    const {skill} = action
    return {
      ...state,
      items: {
        ...state.items,
        ...{[skill.id]: skill}
      }
    }
  } else {
    return state
  }
}

