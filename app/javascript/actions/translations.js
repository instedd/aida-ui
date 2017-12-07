// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import { debounced } from '../utils'

export const FETCH = 'TRANSLATIONS_FETCH'
export const RECEIVE = 'TRANSLATIONS_RECEIVE'
export const UPDATE = 'TRANSLATION_UPDATE'

export const fetchTranslations = (scope : {botId : number}) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  // Don't fetch translations if they are already being fetched
  if (state.translations.fetching) {
    return
  }

  dispatch(startFetchingTranslations(scope))
  return api.fetchTranslations(scope.botId)
            .then(response => dispatch(receiveTranslations(scope, response)))
}

export const startFetchingTranslations = (scope : any) : T.TranslationsAction => ({
  type: FETCH,
  scope,
})

export const receiveTranslations = (scope : any, data : T.TranslationsIndex) : T.TranslationsAction => ({
  type: RECEIVE,
  scope,
  data
})

export const updateTranslation = (botId : number, translation : T.Translation) => (dispatch : T.Dispatch) => {
  dispatch({type: UPDATE, botId, translation})
  dispatch(updateTranslationDelayed(botId, translation))
}

const updateTranslationDelayed = (botId, translation) =>
  debounced(`TRANSLATION_UPDATE_${botId}_${translation.behaviourId}_${translation.key}_${translation.lang}`)(dispatch => {
    console.log('Saving translation')
    api.updateTranslation(botId, translation)
  })
