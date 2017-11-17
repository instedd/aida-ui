import React from 'react'
import Layout from '../ui/Layout'
import Header from '../ui/Header'
import SideBar from '../ui/SideBar'
import { MainContentDemo } from '../ui/MainContent'
import Footer from '../ui/Footer'
import Icon from './Icon'

export const App = () =>
  <Layout
    header={<Header icon={<Icon/>} title="WFP chat bot" />}
    footer={<Footer/>}>
    <MainContentDemo />
    <SideBar />
  </Layout>
