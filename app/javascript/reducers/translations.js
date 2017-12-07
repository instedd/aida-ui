/* @flow */
import * as T from '../utils/types'
import map from 'lodash/map'

import * as actions from '../actions/translations'

const initialState = {
  fetching: false,
  scope: null,
  languages: null,
  defaultLang: null,
  behaviours: null
}

export default (state : T.TranslationsState, action : T.Action) : T.TranslationsState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.RECEIVE: return receive(state, action)
    case actions.UPDATE: return update(state, action)
    default: return state
  }
}

const receive = (state, action) => {
  const { scope, data } = action
  return {
    ...state,
    fetching: false,
    languages: data.languages,
    defaultLang: data.default_language,
    behaviours: data.behaviours
  }
}

const fetch = (state, action) => {
  const { scope } = action
  return {
    ...state,
    fetching: true,
    scope
  }
}

const update = (state, action) => {
  const { botId, translation } = action
  if (state.scope && state.scope.botId != botId) {
    return state
  }

  const updatedBehaviours = map(state.behaviours, behaviour => {
    if (behaviour.id == translation.behaviourId) {
      const updatedKeys = map(behaviour.keys, key => {
        if (key._key == translation.key) {
          return {
            ...key,
            [translation.lang]: translation.value
          }
        } else {
          return key
        }
      })
      return {
        ...behaviour,
        keys: updatedKeys
      }
    } else {
      return behaviour
    }
  })

  return {
    ...state,
    behaviours: updatedBehaviours
  }
}
