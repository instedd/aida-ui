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

import * as channelActions from '../actions/channel'
import * as channelsActions from '../actions/channels'

class BotChannelComponent extends Component {
  componentDidMount() {
    const { permitted, channelLoaded, bot } = this.props
    if (permitted && !channelLoaded) {
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
    const { permitted, channel, bot } = this.props

    if (!permitted) {
      return <ContentDenied />
    }

    if (channel) {
      let setupFields = <div>
        <Field label="Page ID" value={channel.config.page_id} onChange={this.updateConfigField("page_id")} helpText="The Page ID under the More info section on your Facebook Page's About tab" />
        <Field label="Access Token" value={channel.config.access_token} onChange={this.updateConfigField("access_token")} helpText="The Page Access Token you get on the Token Generation section of the Messenger > Settings tab of your Facebook Application" />
      </div>

      if (bot.published) {
        return <SingleColumn>
            <Title>Subscribe channel to Aida</Title>
            <Headline>
              Finish the channel setup taking your callback URL and verify token to
              the <a href="https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup" target="_blank">subscribe bot page</a>.
            </Headline>

            <Field label="Callback URL" defaultValue={`${location.protocol}//${location.host}/callbacks/facebook/`} readOnly />
            <Field label="Verify Token" value={channel.config.verify_token} onChange={this.updateConfigField("verify_token")} />
            { /* TODO: replace `<br /><br />` with proper CSS spacing */ }
            <br /><br />
            <Title>Facebook channel configuration</Title>
            <Headline>
              You can fix your Facebook channel's configuration here in case you've found an error
            </Headline>
            {setupFields}
          </SingleColumn>
      } else {
        return <SingleColumn>
          <Title>Setup a Facebook channel</Title>
          <Headline>
            In order to setup this channel you first need
            to <a href="https://www.facebook.com/business/products/pages" target="_blank">create a Facebook page</a> and
            then paste your credentials here.
            Follow <a href="https://developers.facebook.com/docs/messenger-platform/prelaunch-checklist" target="_blank">Facebook publishing requirements</a> to
            avoid getting your channel banned.<br />

            You will be able to subscribe the bot after you first publish it.
          </Headline>

          {setupFields}
        </SingleColumn>
      }
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
    permitted: hasPermission(bot, 'can_publish'),
    channelLoaded: channelLoaded,
    channel: channel
  }
}

const mapDispatchToProps = (dispatch) => ({
  channelActions: bindActionCreators(channelActions, dispatch),
  channelsActions: bindActionCreators(channelsActions, dispatch),
})

export const BotChannel = connect(mapStateToProps, mapDispatchToProps)(BotChannelComponent)
