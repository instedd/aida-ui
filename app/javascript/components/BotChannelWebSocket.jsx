import React, { Component } from 'react'
import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'

export class BotChannelWebSocket extends Component {
  updateConfigField(field) {
    const {channel, channelActions} = this.props
    return (value) => {
      channelActions.updateChannel({...channel, config: { ...channel.config, [field]: value}})
    }
  }

  updateChannelField(field) {
    const {channel, channelActions} = this.props
    return (value) => {
      channelActions.updateChannel({...channel, [field]: value})
    }
  }

  render() {
    const { channel, errors } = this.props

    return <div>
        <Title>Setup websocket channel</Title>
        <Field label="Name" value={channel.name} onChange={this.updateChannelField('name')} error={errors.filter((e) => e.path[1] == "name")} />
        <Field label="Access Token" value={channel.config.access_token} onChange={this.updateConfigField("access_token")} error={errors.filter((e) => e.path[1] == "access_token")} />
    </div>
  }
}
