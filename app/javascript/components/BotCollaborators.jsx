import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button, Checkbox, DialogContainer, FontIcon, TextField } from 'react-md'

import map from 'lodash/map'
import isFunction from 'lodash/isFunction'
import without from 'lodash/without'
import moment from 'moment'

import { MainGrey } from '../ui/MainGrey'
import Title from '../ui/Title'
import Headline from '../ui/Headline'
import { EmptyLoader }  from '../ui/Loader'
import { Listing, Column } from '../ui/Listing'
import EmptyContent from '../ui/EmptyContent'

import * as actions from '../actions/collaborators'
import * as invitationsActions from '../actions/invitations'

class BotCollaborators extends Component {
  state = {
    email: '',
    roles: []
  }

  componentDidMount() {
    const { bot, actions } = this.props
    actions.fetchCollaborators({ botId: bot.id })
  }

  render() {
    const { bot, loaded, collaborators, invitations, anonymousLink,
            currentUserEmail, invitationsActions,
            actions, dialogVisible, hideDialog, showDialog } = this.props

    let items = map(collaborators, c => ({
      type: 'collaborator',
      email: c.user_email,
      roles: c.roles,
      last_activity: c.last_activity,
      data: c
    })).concat(map(invitations, i => ({
      type: 'invitation',
      email: i.email,
      roles: i.roles,
      last_activity: i.sent_at,
      data: i
    })))

    if (!loaded) {
      return (<EmptyLoader>Loading collaborators for {bot.name}</EmptyLoader>)
    } else {
      const { email, roles } = this.state

      const toggleRole = (roles, role) => {
        const hasRole = roles.indexOf(role) >= 0
        return hasRole ? without(roles, role) : roles.concat([role])
      }

      const inviteCollaborator = () => {
        actions.inviteCollaborator(bot, this.state.email, this.state.roles)
        this.setState({ email: '', roles: [] })
        hideDialog()
      }
      const cancelInvitation = (invitation) => {
        invitationsActions.cancelInvitation(invitation)
      }
      const removeCollaborator = (collaborator) => {
        actions.removeCollaborator(collaborator)
      }
      const resendInvitation = (invitation) => {
        invitationsActions.resendInvitation(invitation)
      }
      const toggleCollaboratorRole = (collaborator, role) => {
        const roles = toggleRole(collaborator.roles, role)
        actions.updateCollaborator({...collaborator, roles})
      }
      const toggleInvitationRole = (role) => {
        this.setState({ roles: toggleRole(this.state.roles, role) })
      }

      const invitationRoleCheckbox = (role, label, description) => (
        <Checkbox id={`role-invitation-${role}`}
                  key={role}
                  name={`role-invitation-${role}`}
                  className="role-toggle-control"
                  onChange={() => toggleInvitationRole(role)}
                  label={<span className="role-description">
                    {label}
                    <span className="hint">{description}</span>
                  </span>} />
      )

      const inviteDialog = (
        <DialogContainer
          id="invite-collaborator-dialog"
          visible={dialogVisible}
          onHide={hideDialog}
          title={<span>
            Invite collaborators
            <span className="subtitle">The access of project collaborators will be managed through roles</span>
          </span>}>
          <TextField id="invite-email"
                     label="Enter collaborator's email"
                     value={email}
                     onChange={email => this.setState({ email })}/>
          <div>
            {[
               invitationRoleCheckbox('publish',   'Publish',   'Can publish the bot and change the channel configuration'),
               invitationRoleCheckbox('behaviour', 'Behaviour', 'Can change skills configuration'),
               invitationRoleCheckbox('content',   'Content',   'Can edit messages and translations'),
               invitationRoleCheckbox('variables', 'Variables', 'Can modify variable values'),
               invitationRoleCheckbox('results',   'Results',   'Can view stats, conversation logs, survey results and feedback'),
            ]}
          </div>
          <div className="action-buttons">
            <Button flat secondary swapTheming id="invite-send-button" onClick={inviteCollaborator}>Send</Button>
            <Button flat id="invite-cancel-button" onClick={hideDialog}>Cancel</Button>
          </div>
          <footer>
            <FontIcon>link</FontIcon> Or invite to collaborate with a <a href={anonymousLink}>single use link</a>
          </footer>
        </DialogContainer>
      )

      if (items.length == 0) {
        return (
          <EmptyContent icon='folder_shared'>
            <Headline>
              You have no collaborators on this project
              <span><a href="javascript:" onClick={showDialog}>Invite them</a></span>
            </Headline>
            {inviteDialog}
          </EmptyContent>
        )
      } else {
        const title = items.length == 1 ? '1 collaborator' : `${items.length} collaborators`
        const renderCollaboratorColumn = (col) => (item) => {
          const className = item.type == 'collaborator' ? '' : 'invitation-row'
          const content = isFunction(col) ? col(item) : item[col]
          return (<span className={className}>{content}</span>)
        }
        const lastActivityContent = (item) => {
          if (item.type == 'invitation' && item.last_activity) {
            return (<span className="invitation-activity">
              {`Invited ${moment(item.last_activity).fromNow()}`}
              <Button icon iconChildren="refresh"
                      onClick={() => resendInvitation(item.data)}
                      tooltipLabel="Resend invitation"
                      tooltipPosition="left"
                      component="a" />
            </span>)
          } else if (item.last_activity) {
            return moment(item.last_activity).fromNow()
          } else {
            return ''
          }
        }
        const toggleRole = (item, role) => {
          if (item.type == 'collaborator') {
            toggleCollaboratorRole(item.data, role)
          }
        }
        const roleContent = role => item => {
          const isChecked = item.roles && item.roles.indexOf(role) >= 0
          return (
            <Checkbox id={`role-${role}-${item.type}-${item.id}`}
                      name={`role-${role}-${item.type}-${item.id}`}
                      aria-label={`Toggle ${role} role`}
                      onChange={() => toggleRole(item, role)}
                      checked={isChecked}
                      disabled={item.type == 'invitation'}
                      checkedCheckboxIcon={<FontIcon>check</FontIcon>}
                      uncheckedCheckboxIcon={null} />
          )
        }
        const renderCollaboratorAction = (item) => {
          if (item.type == 'invitation') {
            return (<Button icon iconChildren="close"
                            className="invitation-row"
                            onClick={() => cancelInvitation(item.data)}
                            tooltipLabel="Cancel invitation"
                            tooltipPosition="left" />)
          } else if (item.email != currentUserEmail) {
            return (<Button icon iconChildren="close"
                            onClick={() => removeCollaborator(item.data)}
                            tooltipLabel="Remove collaborator"
                            tooltipPosition="left" />)
          }
        }
        return (
          <MainGrey>
            <Listing items={items} title={title}>
              <Column title="Email" render={renderCollaboratorColumn('email')} />
              <Column title="Publish" render={renderCollaboratorColumn(roleContent('publish'))} />
              <Column title="Behaviour" render={renderCollaboratorColumn(roleContent('behaviour'))} />
              <Column title="Content" render={renderCollaboratorColumn(roleContent('content'))} />
              <Column title="Variables" render={renderCollaboratorColumn(roleContent('variables'))} />
              <Column title="Results" render={renderCollaboratorColumn(roleContent('results'))} />
              <Column title="Last activity" render={renderCollaboratorColumn(lastActivityContent)} />
              <Column title="" render={renderCollaboratorAction} />
            </Listing>
            {inviteDialog}
          </MainGrey>
        )
      }
    }
  }
}

const mapStateToProps = (state, {bot}) => {
  const { fetching, scope, data } = state.collaborators
  if (!data || fetching || bot.id != scope.botId) {
    return {
      collaborators: [],
      invitations: [],
      loaded: false
    }
  } else {
    return {
      collaborators: data.collaborators,
      invitations: data.invitations,
      anonymousLink: data.anonymous_invitation.link_url,
      loaded: true,
      currentUserEmail: state.auth.userEmail
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  invitationsActions: bindActionCreators(invitationsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(BotCollaborators)
