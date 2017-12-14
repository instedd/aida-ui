// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import * as routes from '../utils/routes'

export const FETCH = 'SKILLS_FETCH'
export const RECEIVE = 'SKILLS_RECEIVE'
export const RECEIVE_ERROR = 'SKILLS_RECEIVE_ERROR'
export const CREATE_SUCCESS = 'SKILLS_CREATE_SUCCESS'

export const fetchSkills = (scope : {botId : number}) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  // Don't fetch ckills if they are already being fetched
  if (state.skills.fetching) {
    return
  }

  // Don't fetch if loaded Skill match filter

  dispatch(startFetchingSkills(scope))
  return api.fetchSkills(scope.botId)
    .then(response => dispatch(receiveSkills(scope, response.entities.skills || {})))
}

export const startFetchingSkills = (scope : any) : T.SkillsAction => ({
  type: FETCH,
  scope,
})

export const receiveSkills = (scope : any, items : T.ById<T.Skill>) : T.SkillsAction => ({
  type: RECEIVE,
  scope,
  items
})

export const createSkill = (scope : {botId : number}, {kind, name} : {name: ?string, kind: string}, history : any) => (dispatch : T.Dispatch) => {
  return api.createSkill(scope.botId, kind, name)
            .then(skill => {
              dispatch(skillCreated(scope, skill))
              history.push(routes.botSkill(scope.botId, skill.id))
            })
            .catch(error => {
              console.error(error)
            })
}

const skillCreated = (scope, skill) : T.SkillsAction => ({
  type: CREATE_SUCCESS,
  scope,
  skill
})
