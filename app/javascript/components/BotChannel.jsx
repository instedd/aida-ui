import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// import * as channelActions from '../actions/channel'
import * as channelsActions from '../actions/channels'

class BotChannelComponent extends Component {
  componentDidMount() {
    const { channelLoaded, bot } = this.props
    if (!channelLoaded) {
      this.props.channelsActions.fetchChannels({botId : bot.id})
    }
  }

  render() {
    const { channel, bot } = this.props

    if (channel) {
      return <p>Channels for {bot.name} -- {channel.name}</p>
    } else {
      return <p>Loading channels for {bot.name}</p>
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
  // channelActions: bindActionCreators(channelActions, dispatch),
  channelsActions: bindActionCreators(channelsActions, dispatch),
})

export const BotChannel = connect(mapStateToProps, mapDispatchToProps)(BotChannelComponent)
