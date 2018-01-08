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
export const REMOVE_VARIABLE = 'VARIABLE_REMOVE'

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

export const _variableUpdate = (botId: number, updatedAttrs: T.UpdatedVariableAttributes): T.VariablesAction => ({
  type: UPDATE_VARIABLE,
  botId,
  updatedAttrs
})

export const _variableRemove = (botId : number, variableId : string, conditionId : ?string) :T.VariablesAction => ({
  type: REMOVE_VARIABLE,
  botId,
  variableId,
  conditionId
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

export const addVariable = (defaultLang: string) : T.VariablesAction => ({
  type: ADD_VARIABLE,
  defaultLang: defaultLang
})

export const removeVariable = (botId : number, variableId: string, conditionId : ?string) => (dispatch : T.Dispatch) => {
  dispatch(_variableRemove(botId, variableId, conditionId))
  api.removeTranslationVariable(botId, variableId, conditionId)
}

export const updateVariable = (botId : number, updatedAttrs : T.UpdatedVariableAttributes) => (dispatch : T.Dispatch) => {
  dispatch(_variableUpdate(botId, updatedAttrs))
  dispatch(_updateVariableDelayed(botId, updatedAttrs)) // server call
}

const _updateVariableDelayed = (botId, updatedAttrs) => {
  const key = `TRANSLATION_UPDATE_VARIABLE_${botId}_${updatedAttrs.id}`

  return debounced(key)(dispatch => {
    api.updateTranslationVariable(botId, updatedAttrs)
  })
}
