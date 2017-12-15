// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

export const RECEIVE = 'CHANNELS_RECEIVE'
export const RECEIVE_ERROR = 'CHANNELS_RECEIVE_ERROR'
export const FETCH = 'CHANNELS_FETCH'

export const _channelsFetch = (scope : any) : T.ChannelsAction => ({
  type: FETCH,
  scope,
})

export const _channelsReceive = (scope : any, items : T.ById<T.Channel>) : T.ChannelsAction => ({
  type: RECEIVE,
  scope,
  items
})

export const _channelsReceiveError = () : T.ChannelsAction => ({
  type: RECEIVE_ERROR
})

export const fetchChannels = (scope : {botId : number}) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  // Don't fetch Channels if they are already being fetched
  if ((state.channels.fetching : boolean)) {
    return
  }

  // Don't fetch if loaded Channel match filter

  dispatch(_channelsFetch(scope))
  return api.fetchChannels(scope.botId)
            .then(response => dispatch(_channelsReceive(scope, response.entities.channels || {})))
            .catch(error => dispatch(_channelsReceiveError()))
}

