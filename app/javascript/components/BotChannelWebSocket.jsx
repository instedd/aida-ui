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


    const accessUrl = (botUuid, accessToken) => {
      if (botUuid && accessToken) return `${location.protocol}//${location.host}/c/${botUuid}/${accessToken}`
    }

    const shortLink = urlKey => {
      if (urlKey) return `${location.protocol}//${location.host}/s/${channel.config.url_key}`
    }

    return <div>
        <Title>Set up a Web channel</Title>
        <Field label="Name" value={channel.name} onChange={this.updateChannelField('name')} error={errors.filter((e) => e.path[1] == "name")} />
        <Field label="Access Url" value={accessUrl(bot.uuid, channel.config.access_token)} readOnly />
        <Field label="Short link" value={shortLink(channel.config.url_key)} readOnly />
    </div>
  }
}
