// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

import * as routes from '../utils/routes'

import { pushNotification } from './notifications'

export const CANCEL = 'INVITATIONS_CANCEL'
export const CANCEL_SUCCESS = 'INVITATIONS_CANCEL_SUCCESS'
export const CANCEL_ERROR = 'INVITATIONS_CANCEL_ERROR'

export const RETRIEVE = 'INVITATION_RETRIEVE'
export const RETRIEVE_SUCCESS = 'INVITATION_RETRIEVE_SUCCESS'
export const RETRIEVE_ERROR = 'INVITATION_RETRIEVE_ERROR'

export const ACCEPT = 'INVITATION_ACCEPT'
export const ACCEPT_SUCCESS = 'INVITATION_ACCEPT_SUCCESS'
export const ACCEPT_ERROR = 'INVITATION_ACCEPT_ERROR'

export const RESEND = 'INVITATION_RESEND'
export const RESEND_SUCCESS = 'INVITATION_RESEND_SUCCESS'
export const RESEND_ERROR = 'INVITATION_RESEND_ERROR'

export const _invitationsCancel = (invitation : T.Invitation) : T.InvitationsAction => ({
  type: CANCEL,
  invitation
})

export const _invitationsCancelSuccess = () : T.InvitationsAction => ({
  type: CANCEL_SUCCESS
})

export const _invitationsCancelError = () : T.InvitationsAction => ({
  type: CANCEL_ERROR
})

export const _invitationRetrieve = (token : string) : T.InvitationsAction => ({
  type: RETRIEVE,
  token
})

export const _invitationRetrieveSuccess = (token : string, invitation : T.InvitationData) : T.InvitationsAction => ({
  type: RETRIEVE_SUCCESS,
  token,
  invitation
})

export const _invitationRetrieveError = (token : string) : T.InvitationsAction => ({
  type: RETRIEVE_ERROR,
  token
})

export const _invitationAccept = (token : string) : T.InvitationsAction => ({
  type: ACCEPT,
  token
})

export const _invitationAcceptSuccess = () : T.InvitationsAction => ({
  type: ACCEPT_SUCCESS,
})

export const _invitationAcceptError = () : T.InvitationsAction => ({
  type: ACCEPT_ERROR
})

export const _invitationResendSuccess = (invitation : T.Invitation) => ({
  type: RESEND_SUCCESS,
  invitation
})


export const cancelInvitation = (invitation : T.Invitation) => (dispatch : T.Dispatch) => {
  dispatch(_invitationsCancel(invitation))
  return api.cancelInvitation(invitation.id)
            .then(response => dispatch(_invitationsCancelSuccess()))
            .catch(error => dispatch(_invitationsCancelError()))
}

export const fetchInvitation = (token : string) => (dispatch : T.Dispatch) => {
  dispatch(_invitationRetrieve(token))
  return api.retrieveInvitation(token)
            .then(invitation => dispatch(_invitationRetrieveSuccess(token, invitation)))
            .catch(error => dispatch(_invitationRetrieveError(token)))
}

export const acceptInvitation = (token : string, history : any) => (dispatch : T.Dispatch) => {
  dispatch(_invitationAccept(token))
  return api.acceptInvitation(token)
            .then(response => {
              dispatch(_invitationAcceptSuccess())
              history.replace(routes.bot(response.bot_id))
            })
            .catch(error => dispatch(_invitationAcceptError()))
}

export const resendInvitation = (invitation : T.Invitation) => (dispatch : T.Dispatch) => {
  api.resendInvitation(invitation.id)
     .then(invitation => {
       dispatch(pushNotification("The invitation email was resent"))
       dispatch(_invitationResendSuccess(invitation))
     })
}
