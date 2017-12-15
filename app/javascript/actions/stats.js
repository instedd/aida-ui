// @flow
import * as T from '../utils/types'

import * as api from '../utils/api'

export const FETCH = 'STATS_FETCH'
export const FETCH_SUCCESS = 'STATS_FETCH_SUCCESS'
export const FETCH_ERROR = 'STATS_FETCH_ERROR'

export const _statsFetch = (botId : number, period: T.StatsPeriod) : T.StatsAction => ({
  type: FETCH,
  botId,
  period
})

export const _statsFetchSuccess = (botId : number, period: T.StatsPeriod, data : T.BotStats) : T.StatsAction => ({
  type: FETCH_SUCCESS,
  botId,
  period,
  data
})

export const _statsFetchError = (botId : number, period: T.StatsPeriod, error : string) : T.StatsAction => ({
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

  dispatch(_statsFetch(botId, period))
  api.fetchStats(botId, period)
     .then((data) => dispatch(_statsFetchSuccess(botId, period, data)))
     .catch((error) => dispatch(_statsFetchError(botId, period, error)))
}
