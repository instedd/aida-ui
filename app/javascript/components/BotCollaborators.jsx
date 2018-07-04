import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button, Checkbox, DialogContainer, FontIcon, TextField, Tooltipped } from 'react-md'

import map from 'lodash/map'
import isFunction from 'lodash/isFunction'
import without from 'lodash/without'
import moment from 'moment'
import copy from 'clipboard-copy'

import { MainWhite } from '../ui/MainWhite'
import Headline from '../ui/Headline'
import { EmptyLoader }  from '../ui/Loader'
import { Listing, Column } from '../ui/Listing'
import EmptyContent from '../ui/EmptyContent'

import * as actions from '../actions/collaborators'
import * as invitationsActions from '../actions/invitations'
import { absoluteUrl } from '../utils/routes'
import { generateToken, hasPermission } from '../utils'
import ContentDenied from './ContentDenied'

const hasRole = (roles, role) => {
  return roles.indexOf(role) >= 0
}

const toggleRole = (roles, role) => {
  return hasRole(roles, role) ? without(roles, role) : roles.concat([role])
}

class CollaboratorsList extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(['anonymous-invitation', 'invitation', 'collaborator']),
      email: PropTypes.string,
      link: PropTypes.string,
      roles: PropTypes.arrayOf(PropTypes.string),
      lastActivity: PropTypes.string,
      data: PropTypes.any
    })).isRequired,
    currentUserEmail: PropTypes.string.isRequired,
    onCancelInvitation: PropTypes.func.isRequired,
    onResendInvitation: PropTypes.func.isRequired,
    onRemoveCollaborator: PropTypes.func.isRequired,
    onToggleCollaboratorRole: PropTypes.func.isRequired
  }

  render() {
    const { items, currentUserEmail,
            onCancelInvitation, onResendInvitation,
            onRemoveCollaborator, onToggleCollaboratorRole } = this.props

    const title = items.length == 1 ? '1 collaborator' : `${items.length} collaborators`
    const renderCollaboratorColumn = (col) => (item) => {
      const className = item.type == 'collaborator' ? '' : 'invitation-row'
      const content = isFunction(col) ? col(item) : item[col]
      return (<span className={className}>{content}</span>)
    }
    const lastActivityContent = (item) => {
      if (item.type == 'invitation' && item.lastActivity) {
        return (<span className="invitation-activity">
          {`Invited ${moment(item.lastActivity).fromNow()}`}
          <Button icon iconChildren="refresh"
                  onClick={() => onResendInvitation(item.data)}
                  tooltipLabel="Resend invitation"
                  tooltipPosition="left"
                  component="a" />
        </span>)
      } if (item.type == 'anonymous-invitation' && item.lastActivity) {
        return (<span className="invitation-activity">
          {`Created ${moment(item.lastActivity).fromNow()}`}
        </span>)
      } else if (item.lastActivity) {
        return moment(item.lastActivity).fromNow()
      } else {
        return ''
      }
    }
    const emailContent = item => {
      if (item.type == 'invitation' || item.type == 'collaborator') {
        return item.email
      } else {
        const copyLink = (e) => {
          e.stopPropagation()
          e.preventDefault()
          copy(item.link)
          return false
        }
        return (
          <Tooltipped label="Click to copy the link to the clipboard" position="right">
            <a className="tooltip-link" href={item.link} onClick={copyLink}>
              <FontIcon>link</FontIcon>
              Single use link
            </a>
          </Tooltipped>
        )
      }
    }
    const roleContent = (role) => (item) => {
      const isChecked = hasRole(item.roles, role)
      // const toggle = () => {
      //   if (item.type == 'collaborator') {
      //     // keep at least one role selected
      //     if (item.roles.length > 1 || !isChecked) {
      //       onToggleCollaboratorRole(item.data, role)
      //     }
      //   }
      // }
      // const id = `role-${role}-${item.type}-${item.data.id}`

      return (
        isChecked ? <FontIcon className='black'>check</FontIcon> : null
      )
      // return (
      //   <Checkbox id={id}
      //             name={id}
      //             aria-label={`Toggle ${role} role`}
      //             onChange={toggle}
      //             checked={isChecked}
      //             disabled={item.type != 'collaborator'}
      //             checkedCheckboxIcon={<FontIcon>check</FontIcon>}
      //             uncheckedCheckboxIcon={null} />
      // )
    }
    const renderCollaboratorAction = (item) => {
      if (item.type == 'invitation' || item.type == 'anonymous-invitation') {
        return (<Button icon iconChildren="close"
                        className="invitation-row"
                        onClick={() => onCancelInvitation(item.data)}
                        tooltipLabel="Cancel invitation"
                        tooltipPosition="left"
                        className='btnHover' />)
      } else if (item.email != currentUserEmail) {
        return (<Button icon iconChildren="delete"
                        onClick={() => onRemoveCollaborator(item.data)}
                        tooltipLabel="Remove collaborator"
                        tooltipPosition="left"
                        className='btnHover' />)
      }
    }
    return (
      <Listing items={items} title={title}>
        <Column title="Email"         render={renderCollaboratorColumn(emailContent)} />
        <Column title="Publish"       render={renderCollaboratorColumn(roleContent('publish'))} />
        <Column title="Behaviour"     render={renderCollaboratorColumn(roleContent('behaviour'))} />
        <Column title="Content"       render={renderCollaboratorColumn(roleContent('content'))} />
        <Column title="Variables and tables"     render={renderCollaboratorColumn(roleContent('variables'))} />
        <Column title="Results"       render={renderCollaboratorColumn(roleContent('results'))} />
        <Column title="Operator"       render={renderCollaboratorColumn(roleContent('operator'))} />
        <Column title="Last activity" render={renderCollaboratorColumn(lastActivityContent)} />
        <Column title=""              render={renderCollaboratorAction} />
      </Listing>
    )
  }
}

const newInvitationToken = () => generateToken(20)

class InviteDialog extends Component {
  state = {
    email: '',
    roles: [],
    token: newInvitationToken()
  }

  static propTypes = {
    visible: PropTypes.bool,
    onCancel: PropTypes.func,
    onInvite: PropTypes.func,
    onCreateLink: PropTypes.func,
    invitationLinkPrefix: PropTypes.string
  }

  static defaultProps = {
    visible: true
  }

  render() {
    const { invitationLinkPrefix, visible, onCancel, onCreateLink, onInvite } = this.props
    const { email, roles, token } = this.state

    const invitationUrl = `${invitationLinkPrefix}${token}`

    const resetState = () => this.setState({ email: '', roles: [], token: newInvitationToken() })

    const hideDialog = () => {
      if (onCancel) {
        onCancel()
      }
      resetState()
    }

    const inviteCollaborator = () => {
      if (onInvite) {
        onInvite(email, roles)
      }
      resetState()
    }

    const roleCheckbox = (role, label, description) => (
      <Checkbox id={`role-invitation-${role}`}
                key={role}
                name={`role-invitation-${role}`}
                className="role-toggle-control"
                onChange={() => this.setState({ roles: toggleRole(roles, role) })}
                label={<span className="role-description">
                  {label}
                  <span className="hint">{description}</span>
                </span>} />
    )

    const createLink = (e) => {
      if (onCreateLink) {
        onCreateLink(token, roles)
        copy(invitationUrl)
      }
      resetState()
      e.stopPropagation()
      e.preventDefault()
      return false
    }

    const theLink = (
      <Tooltipped label="Click to copy the link to the clipboard" position="top">
        <a className="tooltip-link" href={invitationUrl} onClick={createLink}>single use link</a>
      </Tooltipped>
    )

    const haveRoles = roles.length > 0
    const haveEmail = email.trim().length > 0

    return (
        <DialogContainer
          id="invite-collaborator-dialog"
          visible={visible}
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
               roleCheckbox('publish',   'Publish',   'Can publish the bot and change the channel configuration'),
               roleCheckbox('behaviour', 'Behaviour', 'Can change skills configuration'),
               roleCheckbox('content',   'Content',   'Can edit messages and translations'),
               roleCheckbox('variables', 'Variables and tables', 'Can modify variable values'),
               roleCheckbox('results',   'Results',   'Can view stats, conversation logs, survey results and feedback'),
               roleCheckbox('operator', 'Operator', 'Can see and answer user messages'),
            ]}
          </div>
          <div className="action-buttons">
            <Button flat secondary swapTheming disabled={!haveRoles || !haveEmail}
                    id="invite-send-button" onClick={inviteCollaborator}>Send</Button>
            <Button flat primary id="invite-cancel-button" onClick={hideDialog}>Cancel</Button>
          </div>
          <footer>
            <FontIcon>link</FontIcon>
            {haveRoles
             ? (<span>Or invite to collaborate with a {theLink}</span>)
             : (<span>Pick at least one role to create a link</span>)}
          </footer>
        </DialogContainer>
    )
  }
}

class BotCollaborators extends Component {
  componentDidMount() {
    const { permitted, bot, actions } = this.props
    if (permitted) {
      actions.fetchCollaborators({ botId: bot.id })
    }
  }

  render() {
    const { permitted, bot, loaded, collaborators, invitations,
            currentUserEmail, invitationsActions,
            actions, dialogVisible, hideDialog, showDialog } = this.props

    if (!permitted) {
      return <ContentDenied />
    }

    if (!loaded) {
      return (<EmptyLoader>Loading collaborators for {bot.name}</EmptyLoader>)
    }

    const sortedInvitations = [...invitations].sort((a, b) => {
      if (a.email && b.email) {
        return a.email < b.email ? -1 : 1
      } else if (a.email) {
        return -1
      } else if (b.email) {
        return 1
      } else {
        return a.sent_at < b.sent_at ? -1 : 1
      }
    })

    const items = map(collaborators, c => ({
      type: 'collaborator',
      email: c.user_email,
      roles: c.roles,
      lastActivity: c.last_activity,
      data: c
    })).concat(map(sortedInvitations, i => ({
      type: i.email ? 'invitation' : 'anonymous-invitation',
      email: i.email,
      link: i.link_url,
      roles: i.roles,
      lastActivity: i.sent_at,
      data: i
    })))

    const inviteCollaborator = (email, roles) => {
      actions.inviteCollaborator(bot, email, roles)
      hideDialog()
    }
    const createInvitationLink = (token, roles) => {
      actions.createAnonymousInvitation(bot, token, roles)
      hideDialog()
    }
    const cancelInvitation = (invitation) => {
      invitationsActions.cancelInvitation(invitation)
    }
    const resendInvitation = (invitation) => {
      invitationsActions.resendInvitation(invitation)
    }
    const removeCollaborator = (collaborator) => {
      actions.removeCollaborator(collaborator)
    }
    const toggleCollaboratorRole = (collaborator, role) => {
      const roles = toggleRole(collaborator.roles, role)
      actions.updateCollaborator({...collaborator, roles})
    }

    const inviteDialog = (<InviteDialog visible={dialogVisible}
                                        onCancel={hideDialog}
                                        onInvite={inviteCollaborator}
                                        onCreateLink={createInvitationLink}
                                        invitationLinkPrefix={absoluteUrl('/invitation/')} />)

    if (items.length == 0) {
      return (
        <EmptyContent icon='folder_shared'>
          <Headline>
            You have no collaborators on this project
            <span><a href="javascript:" onClick={showDialog} className="hrefLink">Invite them</a></span>
          </Headline>
          {inviteDialog}
        </EmptyContent>
      )
    } else {
      return (
        <MainWhite scrolleable>
          <CollaboratorsList items={items}
                             currentUserEmail={currentUserEmail}
                             onRemoveCollaborator={removeCollaborator}
                             onCancelInvitation={cancelInvitation}
                             onResendInvitation={resendInvitation}
                             onToggleCollaboratorRole={toggleCollaboratorRole} />
          {inviteDialog}
        </MainWhite>
      )
    }
  }
}

const mapStateToProps = (state, {bot}) => {
  const { fetching, scope, data } = state.collaborators
  const permitted = hasPermission(bot, 'can_admin')
  if (!data || fetching || bot.id != scope.botId) {
    return {
      permitted,
      collaborators: [],
      invitations: [],
      loaded: false
    }
  } else {
    return {
      permitted,
      collaborators: data.collaborators,
      invitations: data.invitations,
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
