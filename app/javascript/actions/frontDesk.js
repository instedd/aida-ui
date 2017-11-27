// @flow
import * as T from '../utils/types'
import { debounced } from '../utils'

import * as api from '../utils/api'

export const FETCH = 'FRONT_DESK_FETCH'
export const FETCH_SUCCESS = 'FRONT_DESK_FETCH_SUCCESS'
export const FETCH_ERROR = 'FRONT_DESK_FETCH_ERROR'
export const UPDATE_CONFIG = 'FRONT_DESK_UPDATE_CONFIG'

export const fetchFrontDesk = (botId : number) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  if (state.frontDesk.fetching) {
    return
  }

  dispatch({type: FETCH, botId})
  api.fetchFrontDesk(botId)
     .then((data) => dispatch({type: FETCH_SUCCESS, data}))
     .catch((error) => dispatch({type: FETCH_ERROR, error}))
}

export const updateFrontDeskConfig = (key : string, value : any) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const { frontDesk } = getState()
  const data = frontDesk.data
  const oldConfig = (data || {}).config

  const config = { ...oldConfig, [key]: value }

  dispatch({type: UPDATE_CONFIG, config})

  if (frontDesk.botId && data && data.id) {
    dispatch(updateFrontDeskDelayed(frontDesk.botId, {...data, config}))
  }
}

const updateFrontDeskDelayed = (botId, frontDesk) => debounced('FRONT_DESK_UPDATE')(dispatch => {
  console.log('Saving front desk configuration')
  api.updateFrontDesk(botId, frontDesk)
})
