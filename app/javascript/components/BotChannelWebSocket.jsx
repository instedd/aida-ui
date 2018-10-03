import React, { Component } from 'react'
import Title from '../ui/Title'
import Field from '../ui/Field'
import { FontIcon } from 'react-md';

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

    const chatLink = (urlKey) => {
      if (urlKey) {
        return <Field label="Chat link" value={`${location.protocol}//${location.host}/s/${channel.config.url_key}`} readOnly />
      }
      else {
        return <div className="margin"><FontIcon className="v-middle">info_outline</FontIcon> You’ll have a chat link available once the bot is published</div>
      }
    }

    return <div>
        <Title>Set up a Web channel</Title>
        <Field label="Name" value={channel.name} onChange={this.updateChannelField('name')} error={errors.filter((e) => e.path[1] == "name")} />
        {chatLink(channel.config.url_key)}
    </div>
  }
}
