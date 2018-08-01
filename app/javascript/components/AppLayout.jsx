import React, { Component, Children } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Snackbar } from 'react-md'

import Layout from '../ui/Layout'
import Footer from '../ui/Footer'
import Header, { SectionNavLink, UserMenuLink, UserMenuAnchor } from '../ui/Header'
import Icon from './Icon'

import * as notifActions from '../actions/notifications'
import * as messageActions from '../actions/messages'
import * as r from '../utils/routes'

export const AppLayout = ({title, headerNav, headerNavExtra, userName, children, buttonAction, buttonIcon, toasts, notifActions}) => {
  const header = (
    <Header icon={<Icon/>}
            title={title}
            userName={userName}
            userMenuItems={[
              <UserMenuAnchor key={0} label="Sign out" href="/logout" />,
            ]}
            sectionNavLinks={[
              <SectionNavLink key={0} label="Bots" to="/b" />,
              <SectionNavLink key={1} label="API" to={r.settingsApi()} />,
              <SectionNavLink key={2} label="Encryption" to={r.settingsEncryption()} />,
              <SectionNavLink key={3} label={<SectionNavCounter />} to={r.messages()} />,
            ]}
            headerNav={headerNav}
            headerNavExtra={headerNavExtra}
            buttonAction={buttonAction} buttonIcon={buttonIcon} />
  )

  return (
    <Layout header={header} footer={<Footer>version {window.version}</Footer>}>
      {children}
      <Snackbar toasts={toasts} autohide={true} onDismiss={notifActions.dismissNotification} />
    </Layout>
  )
}

class SectionNavCounterComponent extends Component {
  componentDidMount() {
    messageActions.fetchMessages()
  }

  render() {
    const messageCount = Object.values(this.props.messages).length
    if(messageCount > 0) {
      return <span>Messages ({messageCount})</span>
    } else {
      return <span>Messages</span>
    }
  }
}

const mapStateToProps = (state) => ({
  userName: state.auth.userName,
  toasts: state.notifications.toasts,
  messages: state.messages.items || {}
})

const mapDispatchToProps = (dispatch) => ({
  messageActions: bindActionCreators(messageActions, dispatch),
  notifActions: bindActionCreators(notifActions, dispatch)
})

const SectionNavCounter = connect(mapStateToProps, mapDispatchToProps)(SectionNavCounterComponent)

export default connect(mapStateToProps, mapDispatchToProps)(AppLayout)
