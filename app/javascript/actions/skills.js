// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import * as routes from '../utils/routes'
import { botBehaviourUpdated } from './bot'
import { moveSkillOrder, skillToTopOrder } from '../reducers/skills'

export const FETCH = 'SKILLS_FETCH'
export const RECEIVE = 'SKILLS_RECEIVE'
export const RECEIVE_ERROR = 'SKILLS_RECEIVE_ERROR'
export const CREATE_SUCCESS = 'SKILLS_CREATE_SUCCESS'
export const MOVE_SKILL = 'SKILLS_MOVE_SKILL'
export const MOVE_SKILL_TO_TOP = 'SKILLS_MOVE_SKILL_TO_TOP'

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

export const _moveSkill = (source : T.Skill, target : T.Skill) : T.SkillsAction => ({
  type: MOVE_SKILL,
  source,
  target
})

export const _moveSkillToTop = (source : T.Skill) : T.SkillsAction => ({
  type: MOVE_SKILL_TO_TOP,
  source
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
  const order = moveSkillOrder(skills, source, target)
  api.reorderSkills(botId, order).then(() => {
    dispatch(_moveSkill(source, target))
  })
}

export const moveSkillToTop = (botId : number, skills : Array<T.Skill>, source : T.Skill) => (dispatch : T.Dispatch) => {
  const order = skillToTopOrder(skills, source)
  api.reorderSkills(botId, order).then(() => {
    dispatch(_moveSkillToTop(source))
  })
}
