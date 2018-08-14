import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { EmptyLoader }  from '../ui/Loader'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'
import * as channelActions from '../actions/channel'
import * as channelsActions from '../actions/channels'
import { BotChannelWebSocket } from '../components/BotChannelWebSocket'
import { withRouter } from 'react-router'
import { BotChannelFacebook } from './BotChannelFacebook';
import { MainWhite } from '../ui/MainWhite';

class BotChannelComponent extends Component {
  componentDidMount() {
    const { permitted, channel, bot } = this.props
    if (permitted && !channel) {
      this.props.channelsActions.fetchChannels({botId : bot.id})
    }
  }

  render() {
    const { permitted, channel, bot, channelActions } = this.props

    const styles = {
      multiline_tooltip: {
        "white-space": "pre"
      }
    }

    const content = () => {
      if (!permitted) {
        return <ContentDenied />
      }

      if (channel) {
        switch (channel.kind) {
          case 'websocket':
            return <BotChannelWebSocket channel={channel} errors={this.props.errors.filter((e) => e.path[0] == "channels/1")}
                      channelActions={channelActions} ></BotChannelWebSocket>
          case 'facebook':
            return <BotChannelFacebook channel={channel} errors={this.props.errors.filter((e) => e.path[0] == "channels/0")}
                      channelActions={channelActions} bot={bot} ></BotChannelFacebook>
        }
      }
      return <EmptyLoader>Loading channels for {bot.name}</EmptyLoader>
    }

    return <MainWhite>{content()}</MainWhite>
  }
}

const mapStateToProps = ({channels, bots}, {bot, match}) => {
  const getChannel = () => {
    if (channels.scope && channels.scope.botId == bot.id && channels.items) {
      return Object.values(channels.items).find(c => c.id == match.params.c_id)
    }
  }

  return {
    permitted: hasPermission(bot, 'can_publish'),
    channel: getChannel(),
    errors: bots && bots.errors && bots.errors.filter((e) => e.path[0].startsWith("channel")) || []
  }
}

const mapDispatchToProps = (dispatch) => ({
  channelActions: bindActionCreators(channelActions, dispatch),
  channelsActions: bindActionCreators(channelsActions, dispatch),
})

export const BotChannel = withRouter(connect(mapStateToProps, mapDispatchToProps)(BotChannelComponent))
