// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'
import * as routes from '../utils/routes'

export const FETCH = 'MESSAGES_FETCH'
export const ANSWER = 'MESSAGES_ANSWER'
export const RESOLVE = 'MESSAGES_RESOLVE'
export const RECEIVE = 'MESSAGES_RECEIVE'
export const RECEIVE_ERROR = 'MESSAGES_RECEIVE_ERROR'

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

export const _answerMessage = (messageId : number, answer : string) : T.HumanOverrideMessageAction => ({
  type: ANSWER,
  messageId,
  answer
})

export const answerMessage = (messageId : number, answer : string) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch(_answerMessage(messageId, answer))

  api.answerMessage(messageId, answer)
}

export const _resolveMessage = (messageId : number) : T.HumanOverrideMessageAction => ({
  type: RESOLVE,
  messageId
})

export const resolveMessage = (messageId : number) => (dispatch : T.Dispatch, getState : T.GetState) => {
  dispatch(_resolveMessage(messageId))

  api.resolveMessage(messageId)
}
