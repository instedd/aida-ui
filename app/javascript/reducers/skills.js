/* @flow */
import * as T from '../utils/types'
import omit from 'lodash/omit'

import * as actions from '../actions/skills'
import * as skillActions from '../actions/skill'
import findIndex from 'lodash/findIndex'
import reduce from 'lodash/reduce'
import sortBy from 'lodash/sortBy'

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
    case actions.MOVE_SKILL: return moveSkill(state, action)
    case actions.MOVE_SKILL_TO_TOP: return moveSkillToTop(state, action)
    case skillActions.UPDATE: return update(state, action)
    case skillActions.DELETE: return deleteSkill(state, action)
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

const deleteSkill = (state, action) => {
  const {skillId} = action

  return {
    ...state,
    items: omit(state.items, [skillId])
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

const moveSkill = (state, action) => {
  const new_items = {...state.items}
  const source_order = action.source.order
  const target_order = action.target.order
  Object.keys(new_items).map(Number).forEach((id : number) => {
    if (source_order < target_order) {
      if (id == action.source.id) {
        new_items[id] = {...new_items[id], order: target_order}
      } else {
        if (new_items[id].order > source_order && new_items[id].order <= target_order) {
          new_items[id] = {...new_items[id], order: new_items[id].order - 1}
        }
      }
    }
    if (source_order > target_order) {
      if (id == action.source.id) {
        new_items[id] = {...new_items[id], order: target_order + 1}
      } else {
        if (new_items[id].order > action.target.order && new_items[id].order < action.source.order) {
        new_items[id] = {...new_items[id], order: new_items[id].order + 1}
        }
      }
    }
  })

  return {
    ...state,
    items: new_items
  }
}

const moveSkillToTop = (state, action) => {
  const minOrder = sortBy(Object.values(state.items), 'order')[0].order
  const new_items = {...state.items}
  Object.keys(new_items).map(Number).forEach((id : number) => {
    if (id == action.source.id) {
      new_items[id] = {...new_items[id], order: minOrder}
    } else {
      if (new_items[id].order < action.source.order) {
        new_items[id] = {...new_items[id], order: new_items[id].order + 1}
      }
    }
  })

  return {
    ...state,
    items: new_items
  }
}

export const moveSkillOrder = (skills: Array<T.Skill>, source: T.Skill, target: T.Skill) => {
  const res = {}
  const items = skills
  const source_order = source.order
  const target_order = target.order
  skills.forEach((s) => {
    const id = s.id
    if (source_order < target_order) {
      if (id == source.id) {
        res[id] = target_order
      } else {
        if (s.order > source_order && s.order <= target_order) {
          res[id] = s.order - 1
        } else {
          res[id] = s.order
        }
      }
    }
    if (source_order > target_order) {
      if (id == source.id) {
        res[id] = target_order + 1
      } else {
        if (s.order > target_order && s.order < source_order) {
          res[id] = s.order + 1
        } else {
          res[id] = s.order
        }
      }
    }
  })
  return res
}

export const skillToTopOrder = (skills: Array<T.Skill>, source: T.Skill) => {
  const res = {}
  const minOrder = sortBy(skills, 'order')[0].order
  skills.forEach((s) => {
    if (s.id == source.id) {
      res[s.id] = minOrder
    } else {
      if (s.order < source.order) {
        res[s.id] = s.order + 1
      } else {
        res[s.id] = s.order
      }
    }
  })

  return res
}

