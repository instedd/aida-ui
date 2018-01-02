// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

import { pushNotification } from './notifications'

export const UPDATE = 'BOT_UPDATE'
export const PUBLISH = 'BOT_PUBLISH'
export const PUBLISH_SUCCESS = 'BOT_PUBLISH_SUCCESS'
export const UNPUBLISH = 'BOT_UNPUBLISH'
export const UNPUBLISH_SUCCESS = 'BOT_UNPUBLISH_SUCCESS'
export const DELETE = 'BOT_DELETE'

export const _botUpdate = (bot : T.Bot) : T.BotAction => ({
  type: UPDATE,
  bot
})

export const _botPublish = (botId : number) : T.BotAction => ({
  type: PUBLISH,
  botId
})

export const _botPublishSuccess = (botId : number) : T.BotAction => ({
  type: PUBLISH_SUCCESS,
  botId
})

export const _botUnpublish = (botId : number) : T.BotAction => ({
  type: UNPUBLISH,
  botId
})

export const _botUnpublishSuccess = (botId : number) : T.BotAction => ({
  type: UNPUBLISH_SUCCESS,
  botId
})

export const _botDelete = (botId : number) : T.BotAction => ({
  type: DELETE,
  botId
})

export const updateBot = (bot : T.Bot) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch(_botUpdate(bot))

  // TODO debounce / avoid leaving page / in progress
  api.updateBot(bot)
}

export const publishBot = (bot : T.Bot) => (dispatch : T.Dispatch) => {
  dispatch(_botPublish(bot.id))

  return api.publishBot(bot)
            .then(() => {
              dispatch(pushNotification('The bot was published successfully'))
              dispatch(_botPublishSuccess(bot.id))
            })
            .catch(() => dispatch(pushNotification('Bot publication failed')))
}

export const unpublishBot = (bot : T.Bot) => (dispatch : T.Dispatch) => {
  dispatch(_botUnpublish(bot.id))

  return api.unpublishBot(bot)
            .then(() => {
              dispatch(pushNotification('The bot was unpublished'))
              dispatch(_botUnpublishSuccess(bot.id))
            })
            .catch(() => dispatch(pushNotification('Error unpublishing bot')))
}

export const deleteBot = (bot : T.Bot) => (dispatch : T.Dispatch) => {
  return api.deleteBot(bot)
            .then(() => dispatch(_botDelete(bot.id)))
}

export const downloadManifestBot = (bot : T.Bot) => (dispatch : T.Dispatch) => {
  return api.downloadManifestBot(bot.id)
}
