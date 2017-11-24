// @flow
import * as T from '../utils/types'

export const PUSH = 'NOTIF_PUSH'
export const DISMISS = 'NOTIF_DISMISS'

export const pushNotification = (message : string) => ({
  type: PUSH,
  message
})

export const dismissNotification = () => ({
  type: DISMISS
})
