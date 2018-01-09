/* @flow */
import * as T from '../utils/types'
import map from 'lodash/map'
import uuidv4 from 'uuid/v4'
import maxBy from 'lodash/maxBy'

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
    case actions.REMOVE_VARIABLE : return removeVariable(state, action)
    case actions.UPDATE_VARIABLE: return updateVariable(state, action)
    case actions.ADD_CONDITION: return addCondition(state, action)
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
      ...(state.variables || []),
      { id: uuidv4(),
        name: "",
        default_value: {
          [action.defaultLang]: ""
        }
      }
    ]
  }
}

const removeVariable = (state, action) => {
  const { variables } = state
  if (!variables) return state

  const index = variables.findIndex((variable) => variable.id == action.variableId)
  if (index < 0) return state

  if (action.conditionId) {
    const oldVariable = variables[index]
    if (!oldVariable) return state

    const variable = removeCondition(oldVariable, action.conditionId)
    if (!variable) return state

    return {
      ...state,
      variables: [
        ...variables.slice(0, index),
        variable,
        ...variables.slice(index + 1)
      ]
    }
  } else {
    return {
      ...state,
      variables: [
        ...variables.slice(0, index),
        ...variables.slice(index + 1)
      ]
    }
  }
}

const updateVariable = (state, action) => {
  const { variables } = state
  if (!variables) return state

  const index = variables.findIndex((variable) => variable.id == action.updatedAttrs.id)
  if (index < 0) return state
  const oldVariable = variables[index]
  if (!oldVariable) return state

  let variable

  if (action.updatedAttrs.conditionId) {
    variable = updateCondition(oldVariable, action.updatedAttrs)
  } else {
    variable = {
      ...oldVariable,
      name: action.updatedAttrs.name,
      default_value: {
        ...oldVariable.default_value,
        [action.updatedAttrs.lang]: action.updatedAttrs.value
      }
    }
  }

  if (!variable) return state

  return {
    ...state,
    variables: [
      ...variables.slice(0, index),
      variable,
      ...variables.slice(index + 1)
    ]
  }
}

const addCondition = (state, action) => {
  const { variables } = state
  if (!variables) return state

  const index = variables.findIndex((variable) => variable.id == action.variableId)
  if (index < 0) return state
  const oldVariable = variables[index]
  if (!oldVariable) return state

  const lastCV = maxBy(oldVariable.conditional_values, 'order')
  const newOrder = lastCV ? lastCV.order + 1 : 1
  const someLang = Object.keys(oldVariable.default_value)[0]

  const variable = {
    ...oldVariable,
    conditional_values: [
      ...(oldVariable.conditional_values || []),
      {
        id: uuidv4(),
        condition: "",
        order: newOrder,
        value: {
          [someLang]: ""
        }
      }
    ]
  }

  return {
    ...state,
    variables: [
      ...variables.slice(0, index),
      variable,
      ...variables.slice(index + 1)
    ]
  }
}

const removeCondition = (variable, conditionId) => {
  const oldCVs = variable.conditional_values || []
  const cvIx = oldCVs.findIndex(cv => cv.id == conditionId)
  if (cvIx < 0) return null

  return {
    ...variable,
    conditional_values: [
      ...oldCVs.slice(0, cvIx),
      ...oldCVs.slice(cvIx + 1)
    ]
  }
}

const updateCondition = (variable, updatedAttrs) => {
  const oldCVs = variable.conditional_values || []
  const cvIx = oldCVs.findIndex((cv) => cv.id == updatedAttrs.conditionId)
  if (cvIx < 0) return null

  const oldCV = oldCVs[cvIx]
  return {
    ...variable,
    conditional_values: [
      ...oldCVs.slice(0, cvIx),
      {
        ...oldCV,
        condition: updatedAttrs.condition,
        value: {
          ...oldCV.value,
          [updatedAttrs.lang]: updatedAttrs.value
        }
      },
      ...oldCVs.slice(cvIx + 1)
    ]
  }
}