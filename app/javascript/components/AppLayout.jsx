import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Snackbar } from 'react-md'

import Layout from '../ui/Layout'
import Footer from '../ui/Footer'
import Header, { SectionNavLink, UserMenuLink, UserMenuAnchor } from '../ui/Header'
import Icon from './Icon'

import * as notifActions from '../actions/notifications'
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
              <SectionNavLink key={1} label="API" to={r.settingsApi()} />
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

const mapStateToProps = (state) => ({
  userName: state.auth.userName,
  toasts: state.notifications.toasts
})

const mapDispatchToProps = (dispatch) => ({
  notifActions: bindActionCreators(notifActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(AppLayout)
