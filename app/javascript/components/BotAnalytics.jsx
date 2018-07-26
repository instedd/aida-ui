import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Grid, Cell, Paper, SelectField, Divider, Button } from 'react-md'
import { FlexibleWidthXYPlot, YAxis, XAxis, HorizontalBarSeries, VerticalGridLines } from 'react-vis'

import { MainWhite } from '../ui/MainWhite'
import FabButton from '../ui/FabButton'
import { EmptyContent } from '../ui/EmptyContent'
import { Headline } from '../ui/Headline'
import { Metric } from '../ui/Metric'
import Aux from '../hoc/Aux'

import * as actions from '../actions/stats'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'
import * as botActions from '../actions/bot'

const DEFAULT_PERIOD = "this_week"

class BotAnalyticsComponent extends Component {

  componentDidMount() {
    const { bot, permitted, actions } = this.props
    if (permitted && bot.published) {
      actions.fetchStats(bot.id, DEFAULT_PERIOD)
    }
  }

  render() {
    const { bot, permitted, fetching, period, data, actions, onToggleChatWindow, botActions } = this.props

    const buttons = (<FabButton
      icon='chat_bubble'
      fabClass="btn-mainTabs"
      iconChild='file_upload'
      buttonActions={() => onToggleChatWindow()}
      buttonChildActions={() => botActions.publishBot(bot)}/>)

    if (!permitted) {
      return <ContentDenied />
    }

    if (!bot.published) {
      return (
        <Aux>
          {buttons}
          <EmptyContent icon='sentiment_neutral'>
            <Headline>No analytics available</Headline>
            <Divider />
            <p>You’ll be able to view analytics once the bot is published.</p>
          </EmptyContent>
        </Aux>
      )

    }

    const l = (value) => fetching ? "..." : value


    const sidebar = (
      <div className='analyticsBar'>
        <SelectField
          id="period"
          menuItems={[
            {label: "Chatbot performance today", value: "today"},
            {label: "Chatbot performance this week", value: "this_week"},
            {label: "Chatbot performance this month", value: "this_month"}
          ]}
          stripActiveItem={false}
          position={SelectField.Positions.BELOW}
          sameWidth={false}
          value={period || DEFAULT_PERIOD}
          onChange={value => actions.fetchStats(this.props.bot.id, value)}/>
        <Metric label="active users" value={l(data.active_users)}/>
        <Metric label="messages received" value={l(data.messages_received)}/>
        <Metric label="messages sent" value={l(data.messages_sent)}/>
      </div>
    )


    return (
      <MainWhite sidebar={sidebar} buttons={buttons}>
        <h4>Unique users per skill</h4>
        {(() => {
          if (data.behaviours == null) {
            return null
          } else if (data.behaviours.length == 0) {
            return (<center>No data available</center>)
          } else {
            const chart_data = data.behaviours.map(({label, users}) => ({x: users, y: label}))

            return (<FlexibleWidthXYPlot height={300}
                margin={{left: 140, right: 20, top: 10, bottom: 40}}
                yType="ordinal" xType="linear">
              <VerticalGridLines />
              <XAxis />
              <YAxis style={{text: { fontSize: "1em" }}} />
              <HorizontalBarSeries data={chart_data} color="#cedd36" />
            </FlexibleWidthXYPlot>)
          }
        })()}
      </MainWhite>
    )
  }
}

const mapStateToProps = (state, { bot }) => {
  const {fetching, data, period} = state.stats
  return {
    permitted: hasPermission(bot, 'manages_results'),
    fetching,
    data: data || {},
    period
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  botActions: bindActionCreators(botActions, dispatch)
})

export const BotAnalytics = connect(mapStateToProps, mapDispatchToProps)(BotAnalyticsComponent)

export default BotAnalytics
