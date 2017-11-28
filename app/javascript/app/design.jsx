import React from 'react'
import Layout from '../ui/Layout'
import Header, { HeaderNavLink } from '../ui/Header'
import SideBar from '../ui/SideBar'
import { MainContentDemo } from '../ui/MainContent'
import Footer from '../ui/Footer'
import Icon from '../components/Icon'
import { BrowserRouter } from 'react-router-dom'

export const App = () =>
  <BrowserRouter>
    <Layout
      header={
        <Header
          icon={<Icon/>}
          title="WFP chat bot"
          headerNavLinks={[
            <HeaderNavLink label="Analytics" to="#" />,
            <HeaderNavLink label="Data" to="#" />,
            <HeaderNavLink label="Channels" to="#" />,
            <HeaderNavLink label="Behaviour" to="#" />,
            <HeaderNavLink label="Translations" to="#" />,
            <HeaderNavLink label="Collaborators" to="#" />,
          ]}
        />
      }
      footer={<Footer/>}>
      <SideBar />
      <MainContentDemo />
    </Layout>
  </BrowserRouter>
