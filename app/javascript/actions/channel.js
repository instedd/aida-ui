// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

export const UPDATE = 'CHANNEL_UPDATE'

export const updateChannel = (channel : T.Channel) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch({type: UPDATE, channel})

  // TODO debounce / avoid leaving page / in progress
  api.updateChannel(channel)
}
