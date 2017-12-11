// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import assign from 'lodash/assign'

import * as skillActions from './skill'

export const UPLOAD = 'XLSFORMS_UPLOAD'
export const UPLOAD_SUCCESS = 'XLSFORMS_UPLOAD_SUCCESS'
export const UPLOAD_ERROR = 'XLSFORMS_UPLOAD_ERROR'

export const uploadXlsFormFor = (survey : T.Skill, file : any) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  const uploadStatus = state.xlsForms.uploadStatus[survey.id]
  if (uploadStatus && uploadStatus.uploading) {
    // already uploading a file for this survey
    return
  }

  dispatch(startUpload(survey.id))
  const emptySurvey = ({
    ...survey,
    config: assign(survey.config, {questions: [], choice_lists: []})
  } : any)
  dispatch(skillActions.updateSkill((emptySurvey : T.Skill)))

  return api.uploadXlsForm(file)
            .then(form => {
              const newState = getState()
              const latestSkill = newState.skills.items &&
                                  newState.skills.items[survey.id.toString()]

              if (latestSkill) {
                const uploadedSurvey = ({
                  ...latestSkill,
                  config: assign(latestSkill.config, form)
                } : any)
                dispatch(skillActions.updateSkill((uploadedSurvey : T.Skill)))
              }
              dispatch(uploadSucceeded(survey.id, form))
            })
            .catch(errResponse => {
              if (errResponse.status == 422) {
                errResponse.json().then(error => {
                  dispatch(uploadError(survey.id, error))
                })
              } else {
                dispatch(uploadError(survey.id, errResponse.statusText))
              }
            })
}

const startUpload = (surveyId) => {
  return {
    type: UPLOAD,
    surveyId
  }
}

const uploadSucceeded = (surveyId, surveyConfig) => {
  return {
    type: UPLOAD_SUCCESS,
    surveyId
  }
}

const uploadError = (surveyId, error) => {
  return {
    type: UPLOAD_ERROR,
    surveyId,
    error: error.error
  }
}
