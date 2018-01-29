/* @flow */
import * as T from '../utils/types'

import * as actions from '../actions/tables'
import mapValues from 'lodash/mapValues'
import omit from 'lodash/omit'

const initialState = {
  fetching: false,
  scope: null,
  items: null,
  uploading: false,
  uploadError: null,
  uploadedData: null
}

export default (state : T.TablesState, action : T.Action) : T.TablesState => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.FETCH_SUCCESS: return fetchSuccess(state, action)
    case actions.FETCH_ERROR: return fetchError(state, action)
    case actions.CREATE_SUCCESS: return createSuccess(state, action)
    case actions.TABLE_UPDATED: return tableUpdated(state, action)
    case actions.DESTROY: return destroy(state, action)
    case actions.UPLOAD: return upload(state, action)
    case actions.UPLOAD_SUCCESS: return uploadSuccess(state, action)
    case actions.UPLOAD_ERROR: return uploadError(state, action)
    case actions.UPLOAD_RESET: return uploadReset(state, action)
    default: return state
  }
}

const fetch = (state, action) => {
  const {scope} = action
  return {
    ...state,
    fetching: true,
    scope,
    items: null,
  }
}

const fetchSuccess = (state, action) => {
  const {scope, items} = action
  if (state.scope && scope.botId == state.scope.botId) {
    const loadedItems = state.items || {}
    return {
      ...state,
      fetching: false,
      scope,
      items: mapValues(items, (item, id) => {
        // retain data for previously loaded tables
        if (loadedItems[id]) {
          return {
            ...item,
            data: loadedItems[id].data
          }
        } else {
          return item
        }
      }),
    }
  } else {
    return state
  }
}

const fetchError = (state, action) => {
  const {scope} = action
  if (state.scope && scope.botId == state.scope.botId) {
    return {
      ...state,
      fetching: false,
      scope,
      items: null,
    }
  } else {
    return state
  }
}

const tableUpdated = (state, action) => {
  const {table, botId} = action
  if (state.scope && state.scope.botId == botId) {
    return {
      ...state,
      items: {
        ...(state.items || {}),
        [table.id]: table
      }
    }
  } else {
    return state
  }
}

const createSuccess = tableUpdated

const uploadReset = (state, action) => {
  return {
    ...state,
    uploading: false,
    uploadError: null,
    uploadedData: null
  }
}

const upload = (state, action) => {
  return {
    ...state,
    uploading: true,
    uploadError: null,
    uploadedData: null
  }
}

const uploadSuccess = (state, action) => {
  const { data } = action
  if (state.uploading) {
    return {
      ...state,
      uploading: false,
      uploadedData: data
    }
  } else {
    return state
  }
}

const uploadError = (state, action) => {
  const { error } = action
  if (state.uploading) {
    return {
      ...state,
      uploading: false,
      uploadError: error
    }
  } else {
    return state
  }
}

const destroy = (state, action) => {
  const { tableId } = action
  return {
    ...state,
    items: omit(state.items, [tableId])
  }
}
