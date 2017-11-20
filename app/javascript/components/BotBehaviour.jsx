import React, { Component, Children, cloneElement } from 'react'

export class BotBehaviour extends Component {
  render() {
    const { bot } = this.props

    return <p>Behaviour of {bot.name}</p>
  }
}
