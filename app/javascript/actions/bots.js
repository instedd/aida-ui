// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import * as routes from '../utils/routes'

export const FETCH = 'BOTS_FETCH'
export const RECEIVE = 'BOTS_RECEIVE'
export const RECEIVE_ERROR = 'BOTS_RECEIVE_ERROR'
export const CREATE_SUCCESS = 'BOTS_CREATE_SUCCESS'

export const fetchBots = () => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  // Don't fetch Bots if they are already being fetched
  if ((state.bots.fetching : boolean)) {
    return
  }

  dispatch(startFetchingBots())
  return api.fetchBots()
    .then(response => dispatch(receiveBots(response.entities.bots || {})))
}

export const createBot = (history : any) => (dispatch : T.Dispatch) => {
  return api.createBot()
            .then(bot => {
              dispatch(botCreated(bot))
              history.push(routes.bot(bot.id))
            })
            .catch(error => {
              console.error(error)
            })
}

const botCreated = (bot) => ({
  type: CREATE_SUCCESS,
  bot
})

export const startFetchingBots = () : T.BotsAction => ({
  type: FETCH
})

export const receiveBots = (items : T.ById<T.Bot>) : T.BotsAction => ({
  type: RECEIVE,
  items
})
