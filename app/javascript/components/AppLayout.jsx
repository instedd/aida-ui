import React from 'react'

import Layout from '../ui/Layout'
import Header from '../ui/Header'
import MainContent from '../ui/MainContent'
import Icon from './Icon'

export const AppLayout = ({title, children}) =>
  <Layout header={<Header icon={<Icon/>} title={title || "WFP chat bot"} />} >
    <MainContent>
      {children}
    </MainContent>
  </Layout>

export default AppLayout
