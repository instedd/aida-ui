import React, { Component, Children, cloneElement } from 'react'
import { MainContent } from '../ui/MainContent'
import FrontDesk from './FrontDesk'
import SideBar from '../ui/SideBar'

export class BotBehaviour extends Component {
  render() {
    const { bot } = this.props

    return <MainContent sidebar={<SideBar/>}>
      <FrontDesk bot={bot} />
    </MainContent>
  }
}
