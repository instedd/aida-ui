// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import { pushNotification } from './notifications'

export const FETCH = 'MESSAGES_FETCH'
export const RESOLVE_SUCCESS = 'MESSAGES_RESOLVE_SUCCESS'
export const RECEIVE = 'MESSAGES_RECEIVE'
export const RECEIVE_ERROR = 'MESSAGES_RECEIVE_ERROR'
export const ADD_SUCCESS = 'MESSAGES_ADD_SUCCESS'

export const _messagesFetch = () : T.HumanOverrideMessageAction => ({
  type: FETCH
})

export const _messagesReceive = (items : T.ById<T.HumanOverrideNotification>) : T.HumanOverrideMessageAction => ({
  type: RECEIVE,
  items
})

export const _messagesReceiveError = () : T.HumanOverrideMessageAction => ({
  type: RECEIVE_ERROR
})

export const fetchMessages = () => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  // Don't fetch Messages if they are already being fetched
  if ((state.messages.fetching : boolean)) {
    return
  }

  dispatch(_messagesFetch())
  return api.fetchMessages()
            .then(response => dispatch(_messagesReceive(response.entities.messages || {})))
            .catch(error => dispatch(_messagesReceiveError()))
}

export const answerMessage = (messageId : number, answer : string) => (dispatch : T.Dispatch, getState : T.GetState) => {
  api.answerMessage(messageId, answer)
    .catch(() => {
      dispatch(pushNotification('Answer could not be sent'))
    })
}

export const _addMessageSuccess = (messageId : number, message : T.DirectionalMessage) : T.HumanOverrideMessageAction => ({
  type: ADD_SUCCESS,
  messageId,
  message
})

export const addMessageSuccess = (messageId : number, message : T.DirectionalMessage) => (dispatch : T.Dispatch, getState : T.GetState) => {
    dispatch(_addMessageSuccess(messageId, message))
}

export const _resolveMessageSuccess = (messageId : number) : T.HumanOverrideMessageAction => ({
  type: RESOLVE_SUCCESS,
  messageId
})

export const resolveMessageSuccess = (messageId : number) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch(_resolveMessageSuccess(messageId))
}

export const resolveMessage = (messageId : number) => (dispatch : T.Dispatch, getState : T.GetState) => {
  api.resolveMessage(messageId)
    .catch(() => {
      dispatch(pushNotification('Message could not be resolved'))
    })
}
