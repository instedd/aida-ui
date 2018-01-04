import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Button, Divider } from 'react-md'

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
      return (
        <AppLayout title={invitation.bot_name}>
          <MainGrey>
           <EmptyContent icon='folder_shared'>
             <Headline>
               {invitation.inviter} has invited you to collaborate on <b>{invitation.bot_name}</b>
             </Headline>
             <Divider className="empty-divider" />
             <p>You will be able to manage behaviour, translations and access data.</p>
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
