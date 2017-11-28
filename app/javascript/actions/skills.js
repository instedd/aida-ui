// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

export const FETCH = 'SKILLS_FETCH'
export const RECEIVE = 'SKILLS_RECEIVE'
export const RECEIVE_ERROR = 'SKILLS_RECEIVE_ERROR'

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
