import React, { Component } from 'react'
import { Button, Divider } from 'react-md'

import { EmptyContent } from '../ui/EmptyContent'
import { Headline } from '../ui/Headline'

export class BotData extends Component {
  render() {
    const { bot } = this.props

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
        <Button flat secondary href={`/api/v1/bots/${bot.id}/data`}>Download CSV</Button>
      </EmptyContent>
    )
  }
}

export default BotData
