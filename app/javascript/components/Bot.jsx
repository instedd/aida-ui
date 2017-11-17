import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as actions from '../actions/bots'

import AppLayout from '../app/AppLayout'

export class BotComponent extends Component {
  componentDidMount() {
    const { botsLoaded } = this.props
    if (!botsLoaded) {
      this.props.actions.fetchBots()
    }
  }

  render() {
    const { botsLoaded, bot } = this.props

    if (botsLoaded == true && bot != null) {
      return <AppLayout title={bot.name}/>
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
  actions: bindActionCreators(actions, dispatch),
})

export const Bot = connect(mapStateToProps, mapDispatchToProps)(BotComponent)
