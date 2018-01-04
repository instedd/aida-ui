// @flow
import * as T from '../utils/types'
import { debounced } from '../utils'
import { botBehaviourUpdated } from './bot'

import * as api from '../utils/api'

export const FETCH = 'FRONT_DESK_FETCH'
export const FETCH_SUCCESS = 'FRONT_DESK_FETCH_SUCCESS'
export const FETCH_ERROR = 'FRONT_DESK_FETCH_ERROR'
export const UPDATE_CONFIG = 'FRONT_DESK_UPDATE_CONFIG'

export const _frontDeskFetch = (botId : number) : T.FrontDeskAction => ({
  type: FETCH,
  botId
})

export const _frontDeskFetchSuccess = (data : T.FrontDesk) : T.FrontDeskAction => ({
  type: FETCH_SUCCESS,
  data
})

export const _frontDeskFetchError = () : T.FrontDeskAction => ({
  type: FETCH_ERROR,
})

export const _frontDeskUpdateConfig = (config : T.FrontDeskConfig) : T.FrontDeskAction => ({
  type: UPDATE_CONFIG,
  config
})

export const fetchFrontDesk = (botId : number) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  if ((state.frontDesk.fetching : boolean)) {
    return
  }

  dispatch(_frontDeskFetch(botId))
  api.fetchFrontDesk(botId)
     .then((data) => dispatch(_frontDeskFetchSuccess(data)))
     .catch((error) => dispatch(_frontDeskFetchError()))
}

export const updateFrontDeskConfig = (key : string, value : any) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const { frontDesk } = getState()
  const data = frontDesk.data
  const oldConfig = (data || {}).config

  const config = { ...oldConfig, [key]: value }

  dispatch(_frontDeskUpdateConfig(config))

  if (frontDesk.botId && data && data.id) {
    dispatch(updateFrontDeskDelayed(frontDesk.botId, {...data, config}))
  }
}

const updateFrontDeskDelayed = (botId, frontDesk) => debounced(`FRONT_DESK_UPDATE_${botId}`)(dispatch => {
  api.updateFrontDesk(botId, frontDesk).then(() =>
    dispatch(botBehaviourUpdated())
  )
})
