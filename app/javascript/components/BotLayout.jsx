import React, { Component, Children, cloneElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'

import EditableTitleLabel from '../ui/EditableTitleLabel'
import { HeaderNavLink } from '../ui/Header'

import * as botActions from '../actions/bot'
import * as botsActions from '../actions/bots'
import * as r from '../utils/routes'
import AppLayout from './AppLayout'
import { BotChannel } from '../components/BotChannel'
import { BotBehaviour } from '../components/BotBehaviour'

export class BotLayoutComponent extends Component {
  componentDidMount() {
    const { botsLoaded } = this.props
    if (!botsLoaded) {
      this.props.botsActions.fetchBots()
    }
  }

  render() {
    const { botsLoaded, bot, children } = this.props

    if (botsLoaded == true && bot != null) {
      return <AppLayout
        title={
          <EditableTitleLabel
            title={bot.name}
            onSubmit={(name) => { botActions.updateBot({...bot, name}) }} />
        }
        headerNavLinks={[
          // <HeaderNavLink label="Analytics" to="#" />,
          // <HeaderNavLink label="Data" to="#" />,
          // TODO: use active="/b/:id/channel"  to allow deep linking
          <HeaderNavLink label="Channel" to={r.botChannel(bot.id)} />,
          <HeaderNavLink label="Behaviour" to={r.botBehaviour(bot.id)} />,
          // <HeaderNavLink label="Translations" to="#" />,
          // <HeaderNavLink label="Collaborators" to="#" />,
        ]}
        >

        <Route exact path="/b/:id" render={({match}) => <Redirect to={r.botChannel(match.params.id)} />} />
        <Route exact path="/b/:id/channel" render={() => <BotChannel bot={bot} />} />
        <Route exact path="/b/:id/behaviour" render={() => <BotBehaviour bot={bot} />} />

        {/* Children.map(children, c => cloneElement(c, {bot})) */}
      </AppLayout>
    } else if (botsLoaded == true && bot == null) {
      // TODO if items exists but no id, then 404
      return <AppLayout title="Bot not found" />
    } else {
      return <AppLayout><p>Loading bot...</p></AppLayout>
    }
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
  botActions: bindActionCreators(botActions, dispatch),
  botsActions: bindActionCreators(botsActions, dispatch),
})

export const BotLayout = connect(mapStateToProps, mapDispatchToProps)(BotLayoutComponent)

