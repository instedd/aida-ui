/* @flow */
import * as T from '../utils/types'
import map from 'lodash/map'

import * as actions from '../actions/xlsForms'

const initialState = {
  uploading: {},
}

export default (state : T.XlsFormsState, action : T.Action) : T.XlsFormsState => {
  state = state || initialState
  switch (action.type) {
    case actions.UPLOAD: return upload(state, action)
    case actions.UPLOAD_SUCCESS: return uploadSuccess(state, action)
    case actions.UPLOAD_ERROR: return uploadError(state, action)
    default: return state
  }
}

const upload = (state, action) => {
  const { surveyId } = action
  return {
    ...state,
    uploading: {
      ...state.uploading,
      [surveyId]: true
    },
  }
}

const uploadSuccess = (state, action) => {
  const { surveyId } = action
  return {
    ...state,
    uploading: {
      ...state.uploading,
      [surveyId]: null
    }
  }
}

const uploadError = (state, action) => {
  const { surveyId, error } = action
  return {
    ...state,
    uploading: {
      ...state.uploading,
      [surveyId]: { error }
    }
  }
}
