import React, { Component, Children, cloneElement } from 'react'
import { MainWhite } from '../ui/MainWhite'
import { Route, Redirect } from 'react-router-dom'
import { Button } from 'react-md'

import FrontDesk from './FrontDesk'
import SkillsBar from './SkillsBar'
import BotSkill from './BotSkill'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'

export class BotBehaviour extends Component {
  render() {
    const { bot, onToggleChatWindow } = this.props

    if (!hasPermission(bot, 'manages_behaviour')) {
      return <ContentDenied />
    }

    const buttons = (<Button icon onClick={() => onToggleChatWindow()}>chat</Button>)

    return (
      <MainWhite sidebar={<SkillsBar bot={bot} />} buttons={buttons}>
        <Route exact path="/b/:id/behaviour" render={() => <FrontDesk bot={bot} />} />
        <Route exact path="/b/:id/behaviour/:skill_id" render={({match}) => <BotSkill bot={bot} skillId={match.params.skill_id} />} />
      </MainWhite>
    )
  }
}
