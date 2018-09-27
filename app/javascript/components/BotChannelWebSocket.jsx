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
    const { channel, errors, bot } = this.props

    return <div>
        <Title>Set up a Web channel</Title>
        <Field label="Name" value={channel.name} onChange={this.updateChannelField('name')} error={errors.filter((e) => e.path[1] == "name")} />
        <Field label="Access Url" defaultValue={`${location.protocol}//${location.host}/c/${bot.uuid}/${channel.config.access_token}`} readOnly />
    </div>
  }
}
