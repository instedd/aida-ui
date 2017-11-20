import React from 'react'

import Layout from '../ui/Layout'
import Header from '../ui/Header'
import MainContent from '../ui/MainContent'
import Icon from './Icon'

export const AppLayout = ({title, headerNavLinks, children}) =>
  <Layout header={<Header icon={<Icon/>} title={title || "WFP chat bot"} headerNavLinks={headerNavLinks} />} >
    <MainContent>
      {children}
    </MainContent>
  </Layout>

export default AppLayout
