// @flow
import * as T from '../utils/types'

import * as api from '../utils/api'

export const FETCH = 'STATS_FETCH'
export const FETCH_SUCCESS = 'STATS_FETCH_SUCCESS'
export const FETCH_ERROR = 'STATS_FETCH_ERROR'

export const fetchStats = (botId : number, period : T.StatsPeriod) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  if (state.stats.fetching && state.stats.botId == botId && state.stats.period == period) {
    return
  }

  dispatch({type: FETCH, botId, period})
  api.fetchStats(botId, period)
     .then((data) => dispatch({type: FETCH_SUCCESS, botId, period, data}))
     .catch((error) => dispatch({type: FETCH_ERROR, botId, period, error}))
}
