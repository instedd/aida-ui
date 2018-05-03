// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import * as routes from '../utils/routes'
import { botBehaviourUpdated } from './bot'
import { orderAfterMovingSkill, orderAfterMovingToTop } from '../reducers/skills'

export const FETCH = 'SKILLS_FETCH'
export const RECEIVE = 'SKILLS_RECEIVE'
export const RECEIVE_ERROR = 'SKILLS_RECEIVE_ERROR'
export const CREATE_SUCCESS = 'SKILLS_CREATE_SUCCESS'
export const REORDER = 'SKILLS_REORDER'

export const _skillsFetch = (scope : T.Scope) : T.SkillsAction => ({
  type: FETCH,
  scope,
})

export const _skillsReceive = (scope : T.Scope, items : T.ById<T.Skill>) : T.SkillsAction => ({
  type: RECEIVE,
  scope,
  items
})

export const _skillsReceiveError = () : T.SkillsAction => ({
  type: RECEIVE_ERROR
})

export const _skillsCreateSuccess = (scope : T.Scope, skill : T.Skill) : T.SkillsAction => ({
  type: CREATE_SUCCESS,
  scope,
  skill
})

export const _reorder = (order : any) : T.SkillsAction => ({
  type: REORDER,
  order
})

export const fetchSkills = (scope : {botId : number}) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  // Don't fetch skills if they are already being fetched
  if ((state.skills.fetching : boolean)) {
    return
  }

  // Don't fetch if loaded Skill match filter

  dispatch(_skillsFetch(scope))
  return api.fetchSkills(scope.botId)
            .then(response => dispatch(_skillsReceive(scope, response.entities.skills || {})))
            .catch(error => dispatch(_skillsReceiveError()))
}

export const createSkill = (scope : {botId : number}, {kind, name} : {name: ?string, kind: string}, history : any) => (dispatch : T.Dispatch) => {
  return api.createSkill(scope.botId, kind, name)
            .then(skill => {
              dispatch(_skillsCreateSuccess(scope, skill))
              history.push(routes.botSkill(scope.botId, skill.id))
              dispatch(botBehaviourUpdated())
            })
            .catch(error => {
              console.error(error)
            })
}

export const moveSkill = (botId : number, skills : Array<T.Skill>, source : T.Skill, target : T.Skill) => (dispatch : T.Dispatch) => {
  const order = orderAfterMovingSkill(skills, source, target)
  api.reorderSkills(botId, order).then(() => {
    dispatch(_reorder(order))
  })
}

export const moveSkillToTop = (botId : number, skills : Array<T.Skill>, source : T.Skill) => (dispatch : T.Dispatch) => {
  const order = orderAfterMovingToTop(skills, source)
  api.reorderSkills(botId, order).then(() => {
    dispatch(_reorder(order))
  })
}
