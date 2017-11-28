import React, { Component, Children, cloneElement } from 'react'
import FrontDesk from './FrontDesk'
import SkillsBar from './SkillsBar'

export class BotBehaviour extends Component {
  render() {
    const { bot } = this.props

    return <div className="with-sidebar">
      <div className="sidebar">
        <SkillsBar />
      </div>
      <div className="main-content">
        <FrontDesk bot={bot} />
      </div>
    </div>
  }
}
