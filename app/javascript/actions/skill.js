// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import { debounced } from '../utils'

export const UPDATE = 'SKILL_UPDATE'

export const updateSkill = (skill : T.Skill) => (dispatch : T.Dispatch) => {
  dispatch({type: UPDATE, skill})
  dispatch(updateSkillDelayed(skill))
}

const updateSkillDelayed = (skill) => debounced(`SKILL_UPDATE_${skill.id}`)(dispatch => {
  console.log('Saving skill configuration')
  api.updateSkill(skill)
})

export const toggleSkill = (skill : T.Skill) => (dispatch : T.Dispatch) => {
  console.log(`Toggle skill ${skill.id}`)
  const toggledSkill = ({...skill, enabled: !skill.enabled} : any)
  dispatch(updateSkill((toggledSkill : T.Skill)))
}
