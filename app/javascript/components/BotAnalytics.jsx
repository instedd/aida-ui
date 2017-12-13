import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Grid, Cell, Paper, SelectField, Divider } from 'react-md'
import { FlexibleWidthXYPlot, YAxis, XAxis, HorizontalBarSeries, VerticalGridLines } from 'react-vis'

import { MainGrey } from '../ui/MainGrey'
import { EmptyContent } from '../ui/EmptyContent'
import { Headline } from '../ui/Headline'
import { Metric } from '../ui/Metric'

import * as actions from '../actions/stats'

const DEFAULT_PERIOD = "this_week"

class BotAnalyticsComponent extends Component {

  componentDidMount() {
    const { bot, actions} = this.props
    if (bot.published) {
      actions.fetchStats(bot.id, DEFAULT_PERIOD)
    }
  }

  render() {
    const { bot, fetching, period, data, actions } = this.props

    // const data = [
    //   {x: 605, y: 'Front desk'},
    //   {x: 450, y: 'Language detector'},
    //   {x: 380, y: 'Food survey'},
    //   {x: 10,  y: 'Inactivity check'},
    //   {x: 105, y: 'Food delivery'},
    //   {x: 120, y: 'Profile data'},
    // ];

    if (!bot.published) {
      return (
        <EmptyContent icon='sentiment_neutral'>
          <Headline>No analytics available</Headline>
          <Divider />
          <p>You’ll be able to view analytics once the bot is published.</p>
        </EmptyContent>
      )
    }

    const l = (value) => fetching ? "..." : value

    return (
      <MainGrey>
        <SelectField
          id="period"
          menuItems={[
            {label: "Chatbot performance today", value: "today"},
            {label: "Chatbot performance last 7 days", value: "this_week"},
            {label: "Chatbot performance last 30 days", value: "this_month"}
          ]}
          stripActiveItem={false}
          position={SelectField.Positions.BELOW}
          sameWidth={false}
          value={period || DEFAULT_PERIOD}
          onChange={value => actions.fetchStats(this.props.bot.id, value)}
        />

        <Grid>
          <Cell size={3}>
            <Metric label="active users" value={l(data.active_users)}/>
            <Metric label="messages received" value={l(data.messages_sent)}/>
            <Metric label="messages sent" value={l(data.messages_received)}/>
          </Cell>
          <Cell size={9}>
            <Paper style={{padding: 30}}>
              <h4>Unique users per skill</h4>

              {(() => {
                if (data.behaviours == null) {
                  return null
                } else if (data.behaviours.length == 0) {
                  return (<center>No data available</center>)
                } else {
                  return (<FlexibleWidthXYPlot height={300}
                      margin={{left: 140, right: 20, top: 10, bottom: 40}}
                      yType="ordinal" xType="linear">
                    <VerticalGridLines />
                    <XAxis />
                    <YAxis style={{text: { fontSize: "1em" }}} />
                    <HorizontalBarSeries data={data.reverse()} color="#cedd36" />
                  </FlexibleWidthXYPlot>)
                }
              })()}
            </Paper>
          </Cell>
        </Grid>

      </MainGrey>
    )
  }
}

const mapStateToProps = (state) => {
  const {fetching, data, period} = state.stats
  return {fetching, data, period}
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
})

export const BotAnalytics = connect(mapStateToProps, mapDispatchToProps)(BotAnalyticsComponent)

export default BotAnalytics
