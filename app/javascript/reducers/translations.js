/* @flow */
import * as T from '../utils/types'
import map from 'lodash/map'
import uuidv4 from 'uuid/v4'

import * as actions from '../actions/translations'

const initialState = {
  fetching: false,
  scope: null,
  languages: null,
  defaultLang: null,
  behaviours: null,
  variables: null
}

export default (state : T.TranslationsState, action : T.Action) : T.TranslationsState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.RECEIVE: return receive(state, action)
    case actions.UPDATE: return update(state, action)
    case actions.ADD_VARIABLE: return addVariable(state, action)
    case actions.UPDATE_VARIABLE: return updateVariable(state, action)
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
    behaviours: data.behaviours,
    variables: data.variables
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
    if (behaviour.id == translation.behaviour_id) {
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

const addVariable = (state, action) => {
  return {
    ...state,
    variables: [
      ...state.variables, 
      { id: uuidv4(),
        name: "",
        default_value: {
          [action.default_language]: ""
        }
      }
    ]
  }
}

const updateVariable = (state, action) => {
  const index = state.variables.findIndex((variable) => variable.id == action.updatedAttrs.id)
  if (index < 0) return state
  
  const variable = {
    ...state.variables[index],
    name: action.updatedAttrs.name,
    default_value: {
      ...state.variables[index].default_value,
      [action.updatedAttrs.lang]: action.updatedAttrs.value
    }
  }

  return {
    ...state,
    variables: [
      ...state.variables.slice(0, index),
      variable,
      ...state.variables.slice(index + 1)
    ]
  } 
}