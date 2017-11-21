// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

export const RECEIVE = 'BOTS_RECEIVE'
export const RECEIVE_ERROR = 'BOTS_RECEIVE_ERROR'
export const FETCH = 'BOTS_FETCH'

export const fetchBots = () => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  // Don't fetch Bots if they are already being fetched
  if ((state.bots.fetching : boolean)) {
    return
  }

  dispatch(startFetchingBots())
  return api.fetchBots()
    .then(response => dispatch(receiveBots(response.entities.bots || {})))
}

export const startFetchingBots = () : T.BotsAction => ({
  type: FETCH
})

export const receiveBots = (items : T.ById<T.Bot>) : T.BotsAction => ({
  type: RECEIVE,
  items
})
