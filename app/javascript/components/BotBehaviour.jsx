import React, { Component, Children, cloneElement } from 'react'
import { MainContent } from '../ui/MainContent'
import FrontDesk from './FrontDesk'
import SkillsBar from './SkillsBar'

export class BotBehaviour extends Component {
  render() {
    const { bot } = this.props

    return <MainContent sidebar={<SkillsBar bot={bot} />}>
      <FrontDesk bot={bot} />
    </MainContent>
  }
}
