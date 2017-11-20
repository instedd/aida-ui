import React, { Component, Children, cloneElement } from 'react'

export class BotChannel extends Component {
  render() {
    const { bot } = this.props

    return <p>Channels for {bot.name}</p>
  }
}
