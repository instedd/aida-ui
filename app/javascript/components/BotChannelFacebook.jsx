import React, { Component } from 'react'
import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import TooltipFontIcon from './TooltipFontIcon';

export class BotChannelFacebook extends Component {
  updateConfigField(field) {
    const {channel, channelActions} = this.props
    return (value) => {
      channelActions.updateChannel({...channel, config: { ...channel.config, [field]: value}})
    }
  }

  render() {
    const { channel, bot, errors } = this.props

    const styles = {
      multiline_tooltip: {
        "white-space": "pre"
      }
    }

    let setupFields = <div>
      <Field label="Page ID" value={channel.config.page_id} onChange={this.updateConfigField("page_id")} helpText="The Page ID under the More info section on your Facebook Page's About tab" error={errors.filter((e) => e.path[1] == "page_id")} />
      <Field label="Access Token" value={channel.config.access_token} onChange={this.updateConfigField("access_token")} helpText="The Page Access Token you get on the Token Generation section of the Messenger > Settings tab of your Facebook Application" error={errors.filter((e) => e.path[1] == "access_token")} />
    </div>

    if (bot.published) {
      return <div>
          <Title>Subscribe channel to Aida</Title>
          <Headline>
            Finish the channel setup taking your callback URL and verify token to
            the <a href="https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup" target="_blank" className="hrefLink">subscribe bot page</a>.
          </Headline>

          <Field label="Callback URL" defaultValue={`${location.protocol}//${location.host}/callback/facebook/${bot.uuid}`} readOnly />
          <Field label="Verify Token" value={channel.config.verify_token} onChange={this.updateConfigField("verify_token")} error={errors.filter((e) => e.path[1] == "verify_token")} />
          { /* TODO: replace `<br /><br />` with proper CSS spacing */ }
          <br /><br />
          <Title>Facebook channel configuration</Title>
          <Headline>
            You can fix your Facebook channel's configuration here in case you've found an error
          </Headline>
          {setupFields}
        </div>
    } else {
      return <div>
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
      </div>
    }
  }
}
