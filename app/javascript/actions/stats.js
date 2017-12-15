// @flow
import * as T from '../utils/types'

import * as api from '../utils/api'

export const FETCH = 'STATS_FETCH'
export const FETCH_SUCCESS = 'STATS_FETCH_SUCCESS'
export const FETCH_ERROR = 'STATS_FETCH_ERROR'

export const statsFetch = (botId : number, period: T.StatsPeriod) : T.StatsAction => ({
  type: FETCH,
  botId,
  period
})

export const statsFetchSuccess = (botId : number, period: T.StatsPeriod, data : T.BotStats) : T.StatsAction => ({
  type: FETCH_SUCCESS,
  botId,
  period,
  data
})

export const statsFetchError = (botId : number, period: T.StatsPeriod, error : string) : T.StatsAction => ({
  type: FETCH_ERROR,
  botId,
  period,
  error
})


export const fetchStats = (botId : number, period : T.StatsPeriod) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  if ((state.stats.fetching : boolean)
      && state.stats.botId == botId
      && state.stats.period == period) {
    return
  }

  dispatch(statsFetch(botId, period))
  api.fetchStats(botId, period)
     .then((data) => dispatch(statsFetchSuccess(botId, period, data)))
     .catch((error) => dispatch(statsFetchError(botId, period, error)))
}
