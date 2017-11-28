import React, { Component, Children, cloneElement } from 'react'
import FrontDesk from './FrontDesk'

export class BotBehaviour extends Component {
  render() {
    const { bot } = this.props

    return <FrontDesk bot={bot} />
  }
}
