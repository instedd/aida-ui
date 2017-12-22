// @flow
import * as T from '../utils/types'
import * as api from '../utils/api'

export const FETCH = 'COLLABORATORS_FETCH'
export const FETCH_SUCCESS = 'COLLABORATORS_FETCH_SUCCESS'
export const FETCH_ERROR = 'COLLABORATORS_FETCH_ERROR'

export const INVITE = 'COLLABORATORS_INVITE'
export const INVITE_SUCCESS = 'COLLABORATORS_INVITE_SUCCESS'
export const INVITE_ERROR = 'COLLABORATORS_INVITE_ERROR'

export const CANCEL_INVITATION = 'INVITATIONS_CANCEL'
export const CANCEL_INVITATION_SUCCESS = 'INVITATIONS_CANCEL_SUCCESS'
export const CANCEL_INVITATION_ERROR = 'INVITATIONS_CANCEL_ERROR'

export const REMOVE = 'COLLABORATORS_REMOVE'
export const REMOVE_SUCCESS = 'COLLABORATORS_REMOVE_SUCCESS'
export const REMOVE_ERROR = 'COLLABORATORS_REMOVE_ERROR'

export const _collaboratorsFetch = (scope : T.Scope) : T.CollaboratorsAction => ({
  type: FETCH,
  scope,
})

export const _collaboratorsFetchSuccess = (scope : T.Scope, data : T.CollaboratorsIndex) : T.CollaboratorsAction => ({
  type: FETCH_SUCCESS,
  scope,
  data
})

export const _collaboratorsFetchError = () : T.CollaboratorsAction => ({
  type: FETCH_ERROR
})

export const _collaboratorsInvite = (botId) => ({
  type: INVITE,
})

export const _collaboratorsInviteSuccess = (botId, invitation) => ({
  type: INVITE_SUCCESS,
  botId,
  invitation
})

export const _collaboratorsInviteError = (botId, error) => ({
  type: INVITE_ERROR,
  botId,
  error
})

export const _collaboratorsRemove = (collaborator) => ({
  type: REMOVE,
  collaborator
})

export const _collaboratorsRemoveSuccess = () => ({
  type: REMOVE_SUCCESS
})

export const _collaboratorsRemoveError = () => ({
  type: REMOVE_ERROR
})

export const _invitationsCancel = (invitation) => ({
  type: CANCEL_INVITATION,
  invitation
})

export const _invitationsCancelSuccess = () => ({
  type: CANCEL_INVITATION_SUCCESS
})

export const _invitationsCancelError = () => ({
  type: CANCEL_INVITATION_ERROR
})


export const fetchCollaborators = (scope : {botId : number}) => (dispatch : T.Dispatch, getState : T.GetState) => {
  const state = getState()

  if ((state.collaborators.fetching : boolean) && state.collaborators.scope.botId == scope.botId) {
    return
  }

  dispatch(_collaboratorsFetch(scope))
  return api.fetchCollaborators(scope.botId)
            .then(data => dispatch(_collaboratorsFetchSuccess(scope, data)))
            .catch(error => dispatch(_collaboratorsFetchError()))
}

export const inviteCollaborator = (bot, email) => (dispatch) => {
  dispatch(_collaboratorsInvite(bot.id))
  return api.inviteCollaborator(bot.id, email, 'collaborator')
            .then(invitation => dispatch(_collaboratorsInviteSuccess(bot.id, invitation)))
            .catch(error => dispatch(_collaboratorsInviteError(bot.id, error)))
}

export const cancelInvitation = (invitation) => (dispatch) => {
  dispatch(_invitationsCancel(invitation))
  return api.cancelInvitation(invitation.id)
            .then(response => dispatch(_invitationsCancelSuccess()))
            .catch(error => dispatch(_invitationsCancelError()))
}

export const removeCollaborator = (collaborator) => (dispatch) => {
  dispatch(_collaboratorsRemove(collaborator))
  return api.removeCollaborator(collaborator.id)
            .then(response => dispatch(_collaboratorsRemoveSuccess()))
            .catch(error => dispatch(_collaboratorsRemoveError()))
}
