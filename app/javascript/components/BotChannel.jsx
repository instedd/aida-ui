import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { MainContent } from '../ui/MainContent'
import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import { EmptyLoader }  from '../ui/Loader'

import * as channelActions from '../actions/channel'
import * as channelsActions from '../actions/channels'

class BotChannelComponent extends Component {
  componentDidMount() {
    const { channelLoaded, bot } = this.props
    if (!channelLoaded) {
      this.props.channelsActions.fetchChannels({botId : bot.id})
    }
  }

  updateConfigField(field) {
    const {channel, channelActions} = this.props
    return (value) => {
      channelActions.updateChannel({...channel, config: { ...channel.config, [field]: value}})
    }
  }

  render() {
    const { channel, bot } = this.props

    if (channel) {
      return <MainContent>
        <Title>Setup a Facebook channel</Title>
        <Headline>
          In order to setup this channel you first need to
          create a <a href="https://www.facebook.com/business/products/pages" target="_blank">Facebook page</a> and
          then <a href="https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup" target="_blank">subscribe a bot</a>.
        </Headline>

        <Field label="Page ID" value={channel.config.page_id} onChange={this.updateConfigField("page_id")} />
        <Field label="Verify Token" value={channel.config.verify_token} onChange={this.updateConfigField("verify_token")} />
        <Field label="Access Token" value={channel.config.access_token} onChange={this.updateConfigField("access_token")} />
      </MainContent>
    } else {
      return <EmptyLoader>Loading channels for {bot.name}</EmptyLoader>
    }
  }
}

const mapStateToProps = (state, {bot}) => {
  let channel = null
  let channelLoaded = false
  const channels = state.channels.items

  // TODO deep scope object comparison
  if (state.channels.scope && state.channels.scope.botId == bot.id && channels) {
    const channelsIds = Object.keys(channels)
    channel = channels[channelsIds[0]]
    channelLoaded = true
  } else {
    channelLoaded = false
  }

  return {
    channelLoaded: channelLoaded,
    channel: channel
  }
}

const mapDispatchToProps = (dispatch) => ({
  channelActions: bindActionCreators(channelActions, dispatch),
  channelsActions: bindActionCreators(channelsActions, dispatch),
})

export const BotChannel = connect(mapStateToProps, mapDispatchToProps)(BotChannelComponent)
