// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

import { pushNotification } from './notifications'

export const UPDATE = 'BOT_UPDATE'
export const PUBLISH = 'BOT_PUBLISH'
export const UNPUBLISH = 'BOT_UNPUBLISH'

export const updateBot = (bot : T.Bot) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch({type: UPDATE, bot})

  // TODO debounce / avoid leaving page / in progress
  api.updateBot(bot)
}

export const publishBot = (bot : T.Bot) => (dispatch : T.Dispatch) => {
  dispatch({type: PUBLISH, bot})

  return api.publishBot(bot)
            .then(() => dispatch(pushNotification('The bot was published successfully')))
            .catch(() => dispatch(pushNotification('Bot publication failed')))
}

export const unpublishBot = (bot : T.Bot) => (dispatch : T.Dispatch) => {
  dispatch({type: UNPUBLISH, bot})

  return api.unpublishBot(bot)
            .then(() => dispatch(pushNotification('The bot was unpublished')))
            .catch(() => dispatch(pushNotification('Error unpublishing bot')))
}
