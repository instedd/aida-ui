// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import { debounced } from '../utils'

export const UPDATE = 'SKILL_UPDATE'
export const DELETE = 'SKILL_DELETE'

export const skillUpdate = (skill : T.Skill) : T.SkillAction => ({
  type: UPDATE,
  skill
})

export const skillDelete = (skillId : number) : T.SkillAction => ({
  type: DELETE,
  skillId
})

export const updateSkill = (skill : T.Skill) => (dispatch : T.Dispatch) => {
  dispatch(skillUpdate(skill))
  dispatch(updateSkillDelayed(skill))
}

const updateSkillDelayed = (skill) => debounced(`SKILL_UPDATE_${skill.id}`)(dispatch => {
  api.updateSkill(skill)
})

export const toggleSkill = (skill : T.Skill) => (dispatch : T.Dispatch) => {
  const toggledSkill = ({...skill, enabled: !skill.enabled} : any)
  dispatch(updateSkill((toggledSkill : T.Skill)))
}

export const deleteSkill = (skill : T.Skill) => (dispatch : T.Dispatch) => {
  dispatch(skillDelete(skill.id))
  api.destroySkill(skill)
}
