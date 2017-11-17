import * as api from '../utils/api'

export const UPDATE = 'BOT_UPDATE'

export const updateBot = (bot) => (dispatch, getState) => {
  dispatch({type: UPDATE, bot})

  // TODO debounce / avoid leaving page / in progress
  api.updateBot(bot)
}
