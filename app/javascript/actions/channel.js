// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import { debounced } from '../utils'

export const UPDATE = 'CHANNEL_UPDATE'
export const DELETE = 'CHANNEL_DELETE'

export const _channelUpdate = (channel : T.Channel) : T.ChannelAction => ({
  type: UPDATE,
  channel
})

export const _channelDelete = (channelId : number) : T.ChannelAction => ({
  type: DELETE,
  channelId
})

export const updateChannel = (channel : T.Channel) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch(_channelUpdate(channel))
  dispatch(updateChannelDelayed(channel))
}

const updateChannelDelayed = (channel) => debounced(`CHANNEL_UPDATE_${channel.id}`)(dispatch => {
  api.updateChannel(channel)
})

export const deleteChannel = (channel : T.Channel) => (dispatch : T.Dispatch) => {
  return api.deleteChannel(channel)
            .then(() => dispatch(_channelDelete(channel.id)))
}
