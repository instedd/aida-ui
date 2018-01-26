// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

export const FETCH = 'TABLES_FETCH'
export const FETCH_SUCCESS = 'TABLES_FETCH_SUCCESS'
export const FETCH_ERROR = 'TABLES_FETCH_ERROR'

export const TABLE_UPDATED = 'TABLE_UPDATED'

export const _tablesFetch = (scope : T.Scope) : T.TablesAction => ({
  type: FETCH,
  scope,
})

export const _tablesFetchSuccess = (scope : T.Scope, items : T.ById<T.DataTable>) : T.TablesAction => ({
  type: FETCH_SUCCESS,
  scope,
  items
})

export const _tablesFetchError = (scope : T.Scope) : T.TablesAction => ({
  type: FETCH_ERROR,
  scope
})

export const _tableUpdated = (botId : number, table : T.DataTable) => ({
  type: TABLE_UPDATED,
  botId,
  table
})


export const fetchTables = (scope : {botId : number}) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  if ((state.tables.fetching : boolean)) {
    return
  }

  dispatch(_tablesFetch(scope))
  return api.fetchDataTables(scope.botId)
            .then(response => dispatch(_tablesFetchSuccess(scope, response.entities.data_tables || {})))
            .catch(error => dispatch(_tablesFetchError(scope)))
}

export const fetchTable = (botId : number, tableId : number) => (dispatch : T.Dispatch, getState : T.GetState) => {
  return api.fetchDataTable(tableId)
            .then(table => dispatch(_tableUpdated(botId, table)))
}
