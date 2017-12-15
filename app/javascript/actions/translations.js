// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import { debounced } from '../utils'

export const FETCH = 'TRANSLATIONS_FETCH'
export const RECEIVE = 'TRANSLATIONS_RECEIVE'
export const UPDATE = 'TRANSLATION_UPDATE'

export const _translationsFetch = (scope : T.Scope) : T.TranslationsAction => ({
  type: FETCH,
  scope,
})

export const _translationsReceive = (scope : T.Scope, data : T.TranslationsIndex) : T.TranslationsAction => ({
  type: RECEIVE,
  scope,
  data
})

export const _translationsUpdate = (botId : number, translation : T.Translation) : T.TranslationsAction => ({
  type: UPDATE,
  botId,
  translation
})

export const fetchTranslations = (scope : {botId : number}) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  // Don't fetch translations if they are already being fetched
  if ((state.translations.fetching : boolean)) {
    return
  }

  dispatch(_translationsFetch(scope))
  return api.fetchTranslations(scope.botId)
            .then(response => dispatch(_translationsReceive(scope, response)))
}

export const updateTranslation = (botId : number, translation : T.Translation) => (dispatch : T.Dispatch) => {
  dispatch(_translationsUpdate(botId, translation))
  dispatch(updateTranslationDelayed(botId, translation))
}

const updateTranslationDelayed = (botId, translation) =>
  debounced(`TRANSLATION_UPDATE_${botId}_${translation.behaviour_id}_${translation.key}_${translation.lang}`)(dispatch => {
    api.updateTranslation(botId, translation)
  })
