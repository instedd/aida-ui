// @flow
import * as T from '../utils/types'

import * as actions from '../actions/keypair'

const initialState = {
  fetching: false,
  encryptedKeyPair: null
}

export default (state : T.KeyPairState, action : T.Action) => {
  state = state || initialState
  switch (action.type) {
    case actions.FETCH: return fetch(state, action)
    case actions.FETCH_SUCCESS: return fetchSuccess(state, action)
  }
  return state
}

const fetch = (state, action) => ({
  ...state,
  fetching: true
})

const fetchSuccess = (state, action) => ({
  ...state,
  fetching: false,
  encryptedKeyPair: action.encryptedKeyPair
})
