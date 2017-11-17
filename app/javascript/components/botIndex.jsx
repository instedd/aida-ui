import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import * as actions from '../actions/bots'
import * as routes from '../utils/routes'

import AppLayout from '../app/AppLayout'

export class BotIndexComponent extends Component {
  componentDidMount() {
    this.props.actions.fetchBots()
  }

  render() {
    const { bots } = this.props

    if (bots) {
      const botIds = Object.keys(bots)
      if (botIds.length > 0) {
        return <Redirect to={routes.bot(botIds[0])} />
      }
    }

    return <AppLayout><p>Loading bots...</p></AppLayout>
  }
}

const mapStateToProps = (state) => ({
  bots: state.bots.items
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
})

export const BotIndex = connect(mapStateToProps, mapDispatchToProps)(BotIndexComponent)
