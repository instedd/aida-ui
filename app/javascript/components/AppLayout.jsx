import React from 'react'
import { connect } from 'react-redux'

import Layout from '../ui/Layout'
import Header from '../ui/Header'
import MainContent from '../ui/MainContent'
import Icon from './Icon'

export const AppLayout = ({title, headerNavLinks, userName, children, buttonAction}) => {
  const header = (
    <Header icon={<Icon/>}
            title={title || "WFP chat bot"}
            userName={userName}
            logoutUrl="/logout"
            headerNavLinks={headerNavLinks}
            buttonAction={buttonAction} />
  )

  return (
    <Layout header={header}>
      <MainContent>
        {children}
      </MainContent>
    </Layout>
  )
}

const mapStateToProps = (state) => ({
  userName: state.auth.userName
})

export default connect(mapStateToProps)(AppLayout)
