import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { MainWhite } from '../ui/MainWhite'
import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import { EmptyLoader }  from '../ui/Loader'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'
import TooltipFontIcon from './TooltipFontIcon';

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

    const styles = {
      multiline_tooltip: {
        "white-space": "pre"
      }
    }

    if (!permitted) {
      return <ContentDenied />
    }

    if (channelFacebook || channelWebsocket) {
      let setupFields = <div>
        <Field label="Page ID" value={channelFacebook.config.page_id} onChange={this.updateConfigField("page_id", "facebook")} helpText="The Page ID under the More info section on your Facebook Page's About tab" />
        <Field label="Access Token" value={channelFacebook.config.access_token} onChange={this.updateConfigField("access_token", "facebook")} helpText="The Page Access Token you get on the Token Generation section of the Messenger > Settings tab of your Facebook Application" />
      </div>

      let websocketSetup =  <div><br />
          <Title>Setup a websocket channel</Title>
          <Headline>If you don't need an extra websocket channel, leave this section empty</Headline>
          <Field label="Access Token" value={channelWebsocket.config.access_token} onChange={this.updateConfigField("access_token", "websocket")} />
        </div>

      if (bot.published) {
        return <MainWhite>
            <Title>Subscribe channel to Aida</Title>
            <Headline>
              Finish the channel setup taking your callback URL and verify token to
              the <a href="https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup" target="_blank" className="hrefLink">subscribe bot page</a>.
            </Headline>

            <Field label="Callback URL" defaultValue={`${location.protocol}//${location.host}/callback/facebook/`} readOnly />
            <Field label="Verify Token" value={channelFacebook.config.verify_token} onChange={this.updateConfigField("verify_token", "facebook")} />
            { /* TODO: replace `<br /><br />` with proper CSS spacing */ }
            <br /><br />
            <Title>Facebook channel configuration</Title>
            <Headline>
              You can fix your Facebook channel's configuration here in case you've found an error
            </Headline>
            {setupFields}
            {websocketSetup}
          </MainWhite>
      } else {
        return <MainWhite>
          <Title>Setup a Facebook channel</Title>
          <Headline>
            In order to setup this channel you first need
            to <a href="https://www.facebook.com/business/products/pages" target="_blank" className="hrefLink">create a Facebook page</a> and
            then paste your credentials here.
            Follow <a href="https://developers.facebook.com/docs/messenger-platform/prelaunch-checklist" target="_blank" className="hrefLink">Facebook publishing requirements</a> to
            avoid getting your channel banned&nbsp;
            <TooltipFontIcon
              tooltipLabel="Facebook Page must provide customer support contact information.&#013;&#010;Don’t facilitate direct conversations between people and healthcare providers.&#013;&#010;Prevent receiving large amounts of negative feedback or violate Facebook policies."
              tooltipStyle={styles.multiline_tooltip}
              tooltipPosition="top">info_outline
            </TooltipFontIcon>
            .<br />You will be able to subscribe the bot after you first publish it.
          </Headline>
          {setupFields}
          {websocketSetup}
        </MainWhite>
      }
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
