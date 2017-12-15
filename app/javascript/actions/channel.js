// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import { debounced } from '../utils'

export const UPDATE = 'CHANNEL_UPDATE'

export const _channelUpdate = (channel : T.Channel) : T.ChannelAction => ({
  type: UPDATE,
  channel
})

export const updateChannel = (channel : T.Channel) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch(_channelUpdate(channel))
  dispatch(updateChannelDelayed(channel))
}

const updateChannelDelayed = (channel) => debounced(`CHANNEL_UPDATE_${channel.id}`)(dispatch => {
  api.updateChannel(channel)
})
