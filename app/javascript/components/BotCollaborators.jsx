import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button, DialogContainer, FontIcon, TextField } from 'react-md'

import map from 'lodash/map'
import isFunction from 'lodash/isFunction'
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
    email: ''
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
      role: c.role,
      last_activity: c.last_activity,
      data: c
    })).concat(map(invitations, i => ({
      type: 'invitation',
      email: i.email,
      role: i.role,
      last_activity: i.sent_at,
      data: i
    })))

    if (!loaded) {
      return (<EmptyLoader>Loading collaborators for {bot.name}</EmptyLoader>)
    } else {
      const { email } = this.state

      const inviteCollaborator = () => {
        actions.inviteCollaborator(bot, this.state.email)
        this.setState({ email: ''})
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

      const inviteDialog = (
        <DialogContainer
          id="invite-collaborator-dialog"
          visible={dialogVisible}
          onHide={hideDialog}
          title="Invite collaborators">
          <h4>The access of project collaborators will be managed through roles</h4>
          <TextField id="invite-email"
                     label="Enter collaborator's email"
                     value={email}
                     onChange={email => this.setState({ email })}/>
          <div>
            <Button flat primary id="invite-send-button" onClick={inviteCollaborator}>Send</Button>
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
              <Column title="Role" render={renderCollaboratorColumn('role')} />
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
