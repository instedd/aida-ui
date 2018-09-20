// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import { pushNotification } from './notifications'

export const FETCH = 'MESSAGES_FETCH'
export const ANSWER_SUCCESS = 'MESSAGES_ANSWER_SUCCESS'
export const RESOLVE_SUCCESS = 'MESSAGES_RESOLVE_SUCCESS'
export const RECEIVE = 'MESSAGES_RECEIVE'
export const RECEIVE_ERROR = 'MESSAGES_RECEIVE_ERROR'
export const RECEIVE_BROADCAST = 'MESSAGES_RECEIVE_BROADCAST'

export const _messagesFetch = () : T.HumanOverrideMessageAction => ({
  type: FETCH
})

export const _messagesReceive = (items : T.ById<T.HumanOverrideMessage>) : T.HumanOverrideMessageAction => ({
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

export const _answerMessageSuccess = (messageId : number, message : T.DirectionalMessage) : T.HumanOverrideMessageAction => ({
  type: ANSWER_SUCCESS,
  messageId,
  message
})

export const answerMessage = (messageId : number, answer : string) => (dispatch : T.Dispatch, getState : T.GetState) => {
  api.answerMessage(messageId, answer)
    .then((result) => {
      // dispatch(_answerMessageSuccess(messageId, result.message))
    })
    .catch(() => {
      dispatch(pushNotification('Answer could not be sent'))
    })
}

export const _receiveBroadcast = (messageId : number, message : T.DirectionalMessage) : T.HumanOverrideMessageAction => ({
  type: RECEIVE_BROADCAST,
  messageId,
  message
})

export const receiveBroadcast = (messageId : number, message : T.DirectionalMessage) => (dispatch : T.Dispatch, getState : T.GetState) => {
    dispatch(_receiveBroadcast(messageId, message))
}

export const _resolveMessageSuccess = (messageId : number) : T.HumanOverrideMessageAction => ({
  type: RESOLVE_SUCCESS,
  messageId
})

export const resolveMessage = (messageId : number, onResolveSuccess : () => void) => (dispatch : T.Dispatch, getState : T.GetState) => {
  api.resolveMessage(messageId)
    .then(() => {
      dispatch(_resolveMessageSuccess(messageId))
      onResolveSuccess()
    })
    .catch(() => {
      dispatch(pushNotification('Message could not be resolved'))
    })
}
