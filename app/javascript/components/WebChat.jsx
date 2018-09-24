import { Component } from 'react'

export class WebChat extends Component {
  render() {
    const { botId, accessToken } = this.props

    return `botId: ${botId}; accessToken: ${accessToken}`
  }
}
