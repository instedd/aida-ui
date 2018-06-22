import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { SingleColumn } from '../ui/SingleColumn'
import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import { EmptyLoader }  from '../ui/Loader'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'
import { Checkbox } from 'react-md'

import * as channelActions from '../actions/channel'
import * as channelsActions from '../actions/channels'

class BotChannelComponent extends Component {
  componentDidMount() {
    const { permitted, channelLoaded, bot } = this.props
    if (permitted && !channelLoaded) {
      this.props.channelsActions.fetchChannels({botId : bot.id})
    }
  }

  updateConfigField(field, type) {
    const {channelFacebook, channelWebsocket, channelActions} = this.props
    let channel = null
    if(type == "facebook") { channel = channelFacebook } else { channel = channelWebsocket }
    return (value) => {
      channelActions.updateChannel({...channel, config: { ...channel.config, [field]: value}})
    }
  }

  render() {
    const { permitted, channelFacebook, channelWebsocket, bot } = this.props
    console.log(this.props)

    if (!permitted) {
      return <ContentDenied />
    }

    if (channelFacebook || channelWebsocket) {
      return <SingleColumn>
        <Title>Setup a Facebook channel</Title>
        <Headline>
          In order to setup this channel you first need to
          create a <a href="https://www.facebook.com/business/products/pages" target="_blank">Facebook page</a> and
          then <a href="https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup" target="_blank">subscribe a bot</a>.
        </Headline>

        <Field label="Page ID" value={channelFacebook.config.page_id} onChange={this.updateConfigField("page_id", "facebook")} />
        <Field label="Verify Token" value={channelFacebook.config.verify_token} onChange={this.updateConfigField("verify_token", "facebook")} />
        <Field label="Access Token" value={channelFacebook.config.access_token} onChange={this.updateConfigField("access_token", "facebook")} />

        <br />
        <Title>Setup a websocket channel</Title>
        <Headline>If you don't need an extra websocket channel, leave this section empty</Headline>
        <Field label="Access Token" value={channelWebsocket.config.access_token} onChange={this.updateConfigField("access_token", "websocket")} />
      </SingleColumn>
    } else {
      return <EmptyLoader>Loading channels for {bot.name}</EmptyLoader>
    }
  }
}

const mapStateToProps = (state, {bot}) => {
  let channelFacebook = null
  let channelWebsocket = null
  let channelLoaded = false
  const channels = state.channels.items

  // TODO deep scope object comparison
  if (state.channels.scope && state.channels.scope.botId == bot.id && channels) {
    const channelsIds = Object.keys(channels)
    channelFacebook = Object.values(channels).filter(c => c.kind == "facebook")[0]
    channelWebsocket = Object.values(channels).filter(c => c.kind == "websocket")[0]
    channelLoaded = true
  } else {
    channelLoaded = false
  }

  return {
    permitted: hasPermission(bot, 'can_publish'),
    channelLoaded: channelLoaded,
    channelFacebook: channelFacebook,
    channelWebsocket: channelWebsocket
  }
}

const mapDispatchToProps = (dispatch) => ({
  channelActions: bindActionCreators(channelActions, dispatch),
  channelsActions: bindActionCreators(channelsActions, dispatch),
})

export const BotChannel = connect(mapStateToProps, mapDispatchToProps)(BotChannelComponent)
