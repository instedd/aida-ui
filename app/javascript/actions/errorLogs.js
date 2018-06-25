// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

export const FETCH = 'ERROR_LOGS_FETCH'
export const FETCH_SUCCESS = 'ERROR_LOGS_FETCH_SUCCESS'
export const FETCH_ERROR = 'ERROR_LOGS_FETCH_ERROR'

export const _errorLogsFetch = (scope : T.Scope) : T.ErrorLogsAction => ({
  type: FETCH,
  scope,
})

export const _errorLogsFetchSuccess = (scope : T.Scope, items : Array<T.ErrorLog>) : T.ErrorLogsAction => ({
  type: FETCH_SUCCESS,
  scope,
  items
})

export const _errorLogsFetchError = () : T.ErrorLogsAction => ({
  type: FETCH_ERROR
})

export const fetchErrorLogs = (scope : {botId : number}) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  if ((state.errorLogs.fetching : boolean)
      && state.errorLogs.scope
      && state.errorLogs.scope.botId == scope.botId) {
    return
  }

  dispatch(_errorLogsFetch(scope))
  return api.fetchErrorLogs(scope.botId)
            .then(items => dispatch(_errorLogsFetchSuccess(scope, items)))
            .catch(error => dispatch(_errorLogsFetchError()))
}
