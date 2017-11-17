// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

export const UPDATE = 'BOT_UPDATE'

export const updateBot = (bot : T.Bot) => (dispatch : any, getState : any) => {
  dispatch({type: UPDATE, bot})

  // TODO debounce / avoid leaving page / in progress
  api.updateBot(bot)
}
