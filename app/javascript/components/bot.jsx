import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as actions from '../actions/bots'

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
      return <h3>Name: {bot.name}</h3>
    } else if (botsLoaded) {
      // TODO if items exists but no id, then 404
      return <div>Bot not found</div>
    } else {
      return <div>Loading bots...</div>
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
