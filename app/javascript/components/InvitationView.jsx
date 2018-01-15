import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Button, Divider } from 'react-md'
import map from 'lodash/map'
import compact from 'lodash/compact'

import { MainGrey } from '../ui/MainGrey'
import EmptyContent from '../ui/EmptyContent'
import Headline from '../ui/Headline'
import { EmptyLoader } from '../ui/Loader'

import * as actions from '../actions/invitations'
import * as routes from '../utils/routes'

import AppLayout from './AppLayout'

class InvitationView extends Component {
  componentDidMount() {
    const { actions, token } = this.props
    actions.fetchInvitation(token)
  }

  render() {
    const { fetching, invitation, token, history, actions } = this.props

    if (fetching) {
      return <AppLayout title="Invitation"><EmptyLoader>Loading invitation</EmptyLoader></AppLayout>
    } else if (!invitation) {
      return (
        <AppLayout title="Invitation">
          <MainGrey>
           <EmptyContent icon='folder_shared'>
             <Headline>
               Invitation not found
             </Headline>
           </EmptyContent>
          </MainGrey>
        </AppLayout>
      )
    } else {
      const acceptInvitation = () => {
        actions.acceptInvitation(token, history)
      }
      const roleDescriptions = compact(map(invitation.roles, role => {
        switch(role) {
          case 'publish':
            return 'publish the bot and change channel configuration'
          case 'behaviour':
            return 'change skills configuration'
          case 'content':
            return 'edit messages and translations'
          case 'variables':
            return 'modify variables'
          case 'results':
            return 'view stats, conversation logs, survey results and feedback'
        }
      }))
      const roleNode = (() => {
        if (roleDescriptions.length == 0) {
          return null
        } else if (roleDescriptions.length == 1) {
          return (<p>You will be able to {roleDescriptions[0]}.</p>)
        } else {
          return (<div>
            <p>You will be able to:</p>
            <ul>
              {map(roleDescriptions, (description, index) => (<li key={index}>{description}</li>))}
            </ul>
          </div>)
        }
      })()
      return (
        <AppLayout title={invitation.bot_name}>
          <MainGrey>
           <EmptyContent icon='folder_shared'>
             <Headline>
               {invitation.inviter} has invited you to collaborate on <b>{invitation.bot_name}</b>
             </Headline>
             <Divider className="empty-divider" />
             {roleNode}
             <Button primary raised onClick={acceptInvitation}>Accept invitation</Button>
           </EmptyContent>
          </MainGrey>
        </AppLayout>
      )
    }
  }
}

const mapStateToProps = (state, { token }) => {
  const { invitation } = state
  if (invitation.token != token) {
    return {
      fetching: false,
      invitation: null
    }
  } else {
    return {
      fetching: invitation.fetching,
      invitation: invitation.invitation
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(InvitationView))
