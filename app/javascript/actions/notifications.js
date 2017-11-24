// @flow
import * as T from '../utils/types'

export const PUSH = 'NOTIF_PUSH'
export const DISMISS = 'NOTIF_DISMISS'

export const pushNotification = (message : string) => (dispatch : T.Dispatch) => {
  dispatch({type: PUSH, message})
}

export const dismissNotification = (notif : any) => (dispatch : T.Dispatch) => {
  dispatch({type: DISMISS})
}
