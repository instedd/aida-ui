import React, { Component } from 'react'
import { TextField } from 'react-md'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import Loader from '../ui/Loader'

import * as frontDeskActions from '../actions/frontDesk'

class FrontDesk extends Component {
  componentDidMount() {
    const { loaded, actions, bot } = this.props

    if (!loaded) {
      actions.fetchFrontDesk(bot.id)
    }
  }

  render() {
    const { loaded, data, actions } = this.props
    const config = data ? data.config : {}

    if (!loaded) {
      return <Loader>Loading front desk data</Loader>
    }

    const updateConfig = (key) => {
      return (value) => {
        actions.updateFrontDeskConfig(key, value)
      }
    }

    return (
      <div>
        <Title>Front desk</Title>
        <Headline>
          These are basic messages your bot needs to handle. The front desk will
          assign other messages to the skill that is better suited to respond.
        </Headline>

        <Field id="fd-greeting" label="Greeting"
               value={config.greeting} onChange={updateConfig('greeting')} error={this.props.errors.filter((e) => e.path[0].indexOf("greeting") > -1)} />
        <Field id="fd-introduction" label="Skills introduction"
               helpText="The usage explanation of each skill will be appended after this introduction"
               value={config.introduction} onChange={updateConfig('introduction')}
               error={this.props.errors.filter((e) => e.path[0].indexOf("introduction") > -1)} />
        <Field id="fd-not-understood" label="Didn't understand message"
               value={config.not_understood} onChange={updateConfig('not_understood')}
               error={this.props.errors.filter((e) => e.path[0].indexOf("not_understood") > -1)} />
        <h4>
          Show when there is less than &nbsp;
          <TextField id="fd-threshold"
                     type="number"
                     value={Math.round(config.threshold * 100) || 0}
                     min={0} max={50}
                     style={{width: "4em"}}
                     onChange={(value) => { updateConfig('threshold')(parseFloat(value) / 100) }}
                     fullWidth={false} inlineIndicator={<p>%</p>} />
          &nbsp; confidence to tell two matching skills apart
        </h4>
        <Field id="fd-clarification" label="Clarification message"
               helpText="Clarification messages for each matching skill will be appended after this message"
               value={config.clarification} onChange={updateConfig('clarification')}
               error={this.props.errors.filter((e) => e.path[0].indexOf("clarification") > -1)} />
        <Field id="fd-unsubscribe-introduction" label="Unsubscribe introduction message"
               helpText="This message will be sent as the last message of the introduction to explain how to unsubscribe"
               value={config.unsubscribe_introduction_message} onChange={updateConfig('unsubscribe_introduction_message')}
               error={this.props.errors.filter((e) => e.path.indexOf("unsubscribe_introduction_message") > -1)} />
        <Field id="fd-unsubscribe-keywords" label="Unsubscribe keywords (comma separated)"
               value={config.unsubscribe_keywords} onChange={updateConfig('unsubscribe_keywords')}
               error={this.props.errors.filter((e) => e.path.indexOf("unsubscribe_keywords") > -1)} />
        <Field id="fd-unsubscribe-acknowledge" label="Unsubscribe acknowledge message"
               helpText="This message will be sent to confirm the unsubscription success"
               value={config.unsubscribe_acknowledge_message} onChange={updateConfig('unsubscribe_acknowledge_message')}
               error={this.props.errors.filter((e) => e.path.indexOf("unsubscribe_acknowledge_message") > -1)} />
      </div>
    )
  }
}

const mapStateToProps = (state, {bot}) => {
  const { frontDesk } = state
  if (bot && frontDesk.botId == bot.id && !frontDesk.fetching) {
    return {
      loaded: true,
      fetching: frontDesk.fetching,
      data: frontDesk.data || {},
      errors: state.bots && state.bots.errors && state.bots.errors.filter((e) => e.path[0].startsWith("front_desk"))
        || state.chat && state.chat.errors && state.chat.errors.filter((e) => e.path[0].startsWith("front_desk")) || []
    }
  } else {
    return {
      loaded: false,
      fetching: frontDesk.fetching,
      data: {},
      errors: []
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(frontDeskActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(FrontDesk)
