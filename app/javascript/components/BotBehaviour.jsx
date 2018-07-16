import React, { Component, Children, cloneElement } from 'react'
import { MainWhite } from '../ui/MainWhite'
import FabButton from '../ui/FabButton'
import { Route, Redirect } from 'react-router-dom'
import * as botActions from '../actions/bot'
import FrontDesk from './FrontDesk'
import SkillsBar from './SkillsBar'
import BotSkill from './BotSkill'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

export class BotBehaviourComponent extends Component {
  render() {
    const { bot, onToggleChatWindow, botActions } = this.props

    if (!hasPermission(bot, 'manages_behaviour')) {
      return <ContentDenied />
    }

    const buttons = (<FabButton
                      icon='chat_bubble'
                      fabClass="btn-mainTabs"
                      iconChild='file_upload'
                      buttonActions={() => onToggleChatWindow()}
                      buttonChildActions={() => botActions.publishBot(bot)}/>)


    return (
      <MainWhite sidebar={<SkillsBar bot={bot} />} buttons={buttons}>
        <Route exact path="/b/:id/behaviour" render={() => <FrontDesk bot={bot} />} />
        <Route exact path="/b/:id/behaviour/:skill_id" render={({match}) => <BotSkill bot={bot} skillId={match.params.skill_id} />} />
      </MainWhite>
    )
  }
}

const mapStateToProps = (state, {match}) => {
  let bot = null

  if (state.bots.items) {
    bot = state.bots.items[match.params.id] || null
  }

  return {
    botsLoaded: state.bots.items != null,
    bot: bot
  }
}

const mapDispatchToProps = (dispatch) => ({
  botActions: bindActionCreators(botActions, dispatch)
})

export const BotBehaviour = withRouter(connect(mapStateToProps, mapDispatchToProps)(BotBehaviourComponent))
