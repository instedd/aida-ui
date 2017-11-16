import * as api from '../utils/api'

export const RECEIVE = 'BOTS_RECEIVE'
export const RECEIVE_ERROR = 'BOTS_RECEIVE_ERROR'
export const FETCH = 'BOTS_FETCH'

export const fetchBots = () => (dispatch, getState) => {
  const state = getState()

  // Don't fetch Bots if they are already being fetched
  if (state.bots.fetching) {
    return
  }

  dispatch(startFetchingBots())
  return api.fetchBots()
    .then(response => dispatch(receiveBots(response.entities.bots || {})))
}

export const startFetchingBots = () => ({
  type: FETCH
})

export const receiveBots = (items) => ({
  type: RECEIVE,
  items
})
