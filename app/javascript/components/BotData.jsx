import React, { Component } from 'react'
import { Button, Divider } from 'react-md'

import { EmptyContent } from '../ui/EmptyContent'
import { Headline } from '../ui/Headline'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'

export class BotData extends Component {
  render() {
    const { bot } = this.props

    if (!hasPermission(bot, 'manages_results')) {
      return <ContentDenied />
    }

    if (!bot.published) {
      return (
        <EmptyContent icon='sentiment_neutral'>
          <Headline>No data available</Headline>
          <Divider />
          <p>You’ll be able to download data once the bot is published.</p>
        </EmptyContent>
      )
    }

    return (
      <EmptyContent icon='file_download'>
        <Button flat secondary href={`/api/v1/bots/${bot.id}/data.csv`}>Download CSV</Button>
        <p>or download as <a href={`/api/v1/bots/${bot.id}/data.json`} target="_blank">json</a></p>
      </EmptyContent>
    )
  }
}

export default BotData
