// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import { updatePreviewIfActive } from './chat'
import { pushNotification } from './notifications'
import { _botsCreateSuccess } from './bots'
import * as routes from '../utils/routes'

export const UPDATE = 'BOT_UPDATE'
export const PUBLISH = 'BOT_PUBLISH'
export const PUBLISH_SUCCESS = 'BOT_PUBLISH_SUCCESS'
export const PUBLISH_FAILURE = 'BOT_PUBLISH_FAILURE'
export const UNPUBLISH = 'BOT_UNPUBLISH'
export const UNPUBLISH_SUCCESS = 'BOT_UNPUBLISH_SUCCESS'
export const DELETE = 'BOT_DELETE'
export const SELECT = 'BOT_SELECT'

export const _botUpdate = (bot : T.Bot) : T.BotAction => ({
  type: UPDATE,
  bot
})

export const _botPublish = (botId : number) : T.BotAction => ({
  type: PUBLISH,
  botId
})

export const _botPublishSuccess = (botId : number, uuid: string) : T.BotAction => ({
  type: PUBLISH_SUCCESS,
  botId,
  uuid
})

export const _botPublishFailure = (botId : number, errors: any) : T.BotAction => ({
  type: PUBLISH_FAILURE,
  botId,
  errors
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

export const _botSelect = (botId : number) : T.BotAction => ({
  type: SELECT,
  botId
})

export const updateBot = (bot : T.Bot) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch(_botUpdate(bot))

  // TODO debounce / avoid leaving page / in progress
  api.updateBot(bot)
}

export const checkWitAICredentials = (bot : T.Bot, authToken: string) =>
  (dispatch : T.Dispatch, getState : T.GetState) => {
    api.checkWitAICredentials(bot.id, authToken)
      .then(() => {
        dispatch(_botUpdate({...bot, wit_ai_auth_token: authToken}))
      })
      .catch((error) => {
        dispatch(pushNotification('Invalid credentials'))
        dispatch(_botPublishFailure(bot.id, [{
          'message': 'Invalid credentials',
          'path': ['wit_ai']
        }]))
      })
  }

export const publishBot = (bot : T.Bot, fetchChannels : any) => (dispatch : T.Dispatch) => {
  // TODO actually handle this action to show the publish is in progress, or just remove it
  dispatch(_botPublish(bot.id))

  return api.publishBot(bot)
            .then((response) => {
              if (fetchChannels) fetchChannels({botId : bot.id})
              dispatch(pushNotification('The bot was published successfully'))
              dispatch(_botPublishSuccess(bot.id, response.uuid))
            })
            .catch((error) => {
              dispatch(pushNotification('Bot publication failed'))
              error.json().then((json_error) => {
                dispatch(_botPublishFailure(bot.id, json_error.result))
              })
            })
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

export const selectBot = (bot : T.Bot) => (dispatch : T.Dispatch) => {
  dispatch(_botSelect(bot.id))
}

export const leaveBot = (bot : T.Bot) => (dispatch : T.Dispatch) => {
  if (!bot.collaborator_id) return
  return api.removeCollaborator(bot.collaborator_id)
            .then(() => dispatch(_botDelete(bot.id)))
}

export const duplicateBot = (bot : T.Bot, history : any) => (dispatch : T.Dispatch) => {
  return api.duplicateBot(bot.id)
            .then(duplicate => {
              dispatch(_botsCreateSuccess(duplicate))
              history.push(routes.bot(duplicate.id))
            })
            .catch(error => {
              console.error(error)
            })
}
export const botBehaviourUpdated = () => (dispatch : T.Dispatch) => {
  dispatch(updatePreviewIfActive())
}
