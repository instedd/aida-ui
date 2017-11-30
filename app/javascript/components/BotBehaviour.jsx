import React, { Component, Children, cloneElement } from 'react'
import { MainContent } from '../ui/MainContent'
import { Route, Redirect } from 'react-router-dom'

import FrontDesk from './FrontDesk'
import SkillsBar from './SkillsBar'
import BotSkill from './BotSkill'

export class BotBehaviour extends Component {
  render() {
    const { bot } = this.props

    return <MainContent sidebar={<SkillsBar bot={bot} />}>
      <Route exact path="/b/:id/behaviour" render={() => <FrontDesk bot={bot} />} />
      <Route exact path="/b/:id/behaviour/:skill_id" render={({match}) => <BotSkill bot={bot} skillId={match.params.skill_id} />} />
    </MainContent>
  }
}
