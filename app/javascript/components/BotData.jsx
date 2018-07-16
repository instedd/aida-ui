import React, { Component } from 'react'
import { Button, Divider, SelectField } from 'react-md'

import { EmptyContent } from '../ui/EmptyContent'
import { Headline } from '../ui/Headline'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'

const DEFAULT_PERIOD = "none"

export class BotData extends Component {
  constructor(props) {
    super(props)
    this.state = {
      period: DEFAULT_PERIOD
    }
  }
  render() {
    const { bot } = this.props
    const { period } = this.state

    if (!hasPermission(bot, 'manages_results')) {
      return <ContentDenied />
    }

    if (!bot.published) {
      return (
        <EmptyContent icon='storage'>
          <Headline>No data available</Headline>
          <Divider />
          <p>You’ll be able to download data once the bot is published.</p>
        </EmptyContent>
      )
    }

    return (
      <EmptyContent icon='file_download'>
        <SelectField
          id="period"
          menuItems={[
            {label: "Do not include previous results", value: "none"},
            {label: "Include results from today", value: "today"},
            {label: "Include results from this week", value: "this_week"},
            {label: "Include results from this month", value: "this_month"},
            {label: "Include all previous results", value: "all"}
          ]}
          stripActiveItem={false}
          position={SelectField.Positions.BELOW}
          sameWidth={false}
          value={period}
          onChange={value => this.setState({period: value})}/>
        <Button flat secondary href={`/api/v1/bots/${bot.id}/data.csv?period=${period}`}>Download CSV</Button>
        <p>or download as <a href={`/api/v1/bots/${bot.id}/data.json?period=${period}`} target="_blank" className="hrefLink">json</a></p>
      </EmptyContent>
    )
  }
}

export default BotData
