// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

export const FETCH = 'TABLES_FETCH'
export const FETCH_SUCCESS = 'TABLES_FETCH_SUCCESS'
export const FETCH_ERROR = 'TABLES_FETCH_ERROR'

export const CREATE = 'TABLE_CREATE'
export const CREATE_SUCCESS = 'TABLE_CREATE_SUCCESS'
export const CREATE_ERROR = 'TABLE_CREATE_ERROR'

export const UPDATE = 'TABLE_UPDATE'
export const UPDATE_SUCCESS = 'TABLE_UPDATE_SUCCESS'
export const UPDATE_ERROR = 'TABLE_UPDATE_ERROR'

export const DESTROY = 'TABLE_DESTROY'
export const DESTROY_SUCCESS = 'TABLE_DESTROY_SUCCESS'
export const DESTROY_ERROR = 'TABLE_DESTROY_ERROR'

export const UPLOAD = 'TABLES_UPLOAD'
export const UPLOAD_SUCCESS = 'TABLES_UPLOAD_SUCCESS'
export const UPLOAD_ERROR = 'TABLES_UPLOAD_ERROR'
export const UPLOAD_RESET = 'TABLES_UPLOAD_RESET'

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

export const _tablesUpload = () : T.TablesAction => ({
  type: UPLOAD,
})

export const _tablesUploadSuccess = (data : T.DataTableData) : T.TablesAction => ({
  type: UPLOAD_SUCCESS,
  data
})

export const _tablesUploadError = (error : string) : T.TablesAction => ({
  type: UPLOAD_ERROR,
  error
})

export const _tablesUploadReset = () : T.TablesAction => ({
  type: UPLOAD_RESET,
})

export const _tableCreate = () : T.TablesAction => ({
  type: CREATE
})

export const _tableCreateSuccess = (botId : number, table : T.DataTable) : T.TablesAction => ({
  type: CREATE_SUCCESS,
  botId,
  table
})

export const _tableCreateError = (botId : number, error : string) : T.TablesAction => ({
  type: CREATE_ERROR,
  botId,
  error
})

export const _tableUpdate = (table : T.DataTable) : T.TablesAction => ({
  type: UPDATE,
  table
})

export const _tableUpdateSuccess = (table : T.DataTable) : T.TablesAction => ({
  type: UPDATE_SUCCESS,
  table
})

export const _tableUpdateError = (tableId : number, error : string) : T.TablesAction => ({
  type: UPDATE_ERROR,
  tableId,
  error
})

export const _tableDestroy = (tableId : number) : T.TablesAction => ({
  type: DESTROY,
  tableId
})

export const _tableDestroySuccess = (tableId : number) : T.TablesAction => ({
  type: DESTROY_SUCCESS,
  tableId
})

export const _tableDestroyError = (tableId : number, error : string) : T.TablesAction => ({
  type: DESTROY_ERROR,
  tableId,
  error
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
            .then(table => dispatch(_tableUpdateSuccess(table)))
}

export const resetUpload = _tablesUploadReset

export const uploadTableFile = (file : any) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch(_tablesUpload())
  return api.parseDataTable(file)
            .then(data => dispatch(_tablesUploadSuccess(data)))
            .catch(errResponse => {
              if (errResponse.status == 422) {
                errResponse.json().then(error => {
                  dispatch(_tablesUploadError(error.error))
                })
              } else {
                dispatch(_tablesUploadError(errResponse.statusText))
              }
            })
}

export const createTable = (botId : number, name : string, data : T.DataTableData) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch(_tableCreate())
  return api.createDataTable(botId, name, data)
            .then(table => dispatch(_tableCreateSuccess(botId, table)))
            .catch(errResponse => {
              if (errResponse.status == 422) {
                errResponse.json().then(error => {
                  dispatch(_tableCreateError(botId, error.error))
                })
              } else {
                dispatch(_tableCreateError(botId, errResponse.statusText))
              }
            })
}

export const updateTable = (table : T.DataTable) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch(_tableUpdate(table))
  return api.updateDataTable(table)
            .then(table => dispatch(_tableUpdateSuccess(table)))
}

export const destroyTable = (tableId : number) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch(_tableDestroy(tableId))
  return api.destroyDataTable(tableId)
            .then(response => dispatch(_tableDestroySuccess(tableId)))
            .catch(errResponse => dispatch(_tableDestroyError(tableId, errResponse.statusText)))
}
