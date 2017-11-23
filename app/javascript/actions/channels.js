// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

export const RECEIVE = 'CHANNELS_RECEIVE'
export const RECEIVE_ERROR = 'CHANNELS_RECEIVE_ERROR'
export const FETCH = 'CHANNELS_FETCH'

export const fetchChannels = (scope : {botId : number}) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  // Don't fetch Channels if they are already being fetched
  if ((state.channels.fetching : boolean)) {
    return
  }

  // Don't fetch if loaded Channel match filter

  dispatch(startFetchingChannels(scope))
  return api.fetchChannels(scope.botId)
    .then(response => dispatch(receiveChannels(scope, response.entities.channels || {})))
}

export const startFetchingChannels = (scope : any) : T.ChannelsAction => ({
  type: FETCH,
  scope,
})

export const receiveChannels = (scope : any, items : T.ById<T.Channel>) : T.ChannelsAction => ({
  type: RECEIVE,
  scope,
  items
})
