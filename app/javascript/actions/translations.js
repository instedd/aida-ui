// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import { debounced } from '../utils'
import { botBehaviourUpdated } from './bot'

export const FETCH = 'TRANSLATIONS_FETCH'
export const RECEIVE = 'TRANSLATIONS_RECEIVE'
export const UPDATE = 'TRANSLATION_UPDATE'
export const ADD_VARIABLE = 'VARIABLE_ADD'
export const UPDATE_VARIABLE = 'VARIABLE_UPDATE'

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
    api.updateTranslation(botId, translation).then(() =>
      dispatch(botBehaviourUpdated())
    )
  })

export const addVariable = (defaultLang: string) : T.VariablesAction=> ({
  type: ADD_VARIABLE,
  defaultLang: defaultLang
})

export const updateVariable = (botId : number, updatedAttrs : T.UpdatedVariableAttributes) => (dispatch : T.Dispatch) => {
  dispatch(_updateVariable(botId, updatedAttrs))
  dispatch(_updateVariableDelayed(botId, updatedAttrs)) // server call
}

const _updateVariable = (botId : number, updatedAttrs : T.UpdatedVariableAttributes) : T.VariablesAction => ({
  type: UPDATE_VARIABLE,
  botId,
  updatedAttrs
})

const _updateVariableDelayed = (botId, updatedAttrs) => {
  const key = `TRANSLATION_UPDATE_VARIABLE_${botId}_${updatedAttrs.id}`

  return debounced(key)(dispatch => {
    api.updateTranslationVariable(botId, updatedAttrs)
       .then(() => console.log('ready variable'))
  })
}
