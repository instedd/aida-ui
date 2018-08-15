// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import * as routes from '../utils/routes'

export const RECEIVE = 'CHANNELS_RECEIVE'
export const RECEIVE_ERROR = 'CHANNELS_RECEIVE_ERROR'
export const FETCH = 'CHANNELS_FETCH'
export const CREATE = 'CHANNELS_CREATE'
export const CREATE_SUCCESS = 'CHANNELS_CREATE_SUCCESS'
export const CREATE_FAILURE = 'CHANNELS_CREATE_FAILURE'

export const _channelsFetch = (scope : any) : T.ChannelsAction => ({
  type: FETCH,
  scope,
})

export const _channelsCreate = (scope : any) : T.ChannelsAction => ({
  type: CREATE,
  scope,
})

export const _channelsCreateSuccess = (channel : T.Channel) : T.ChannelsAction => ({
  type: CREATE_SUCCESS,
  channel
})

export const _channelsCreateFailure = () : T.ChannelsAction => ({
  type: CREATE_FAILURE
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

export const createChannel = (scope : {botId : number}, kind : string, history : any) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  // Don't create Channels if they are already being created
  if ((state.channels.creating : boolean)) {
    return
  }

  dispatch(_channelsCreate(scope))

  const { botId } = scope

  return api.createChannel(botId, kind)
            .then(channel => {
              dispatch(_channelsCreateSuccess(channel))
              history.push(routes.botChannel(botId, channel.id))
            })
            .catch(error => {
              dispatch(_channelsCreateFailure())
            })
}
