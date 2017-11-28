import React, { Component } from 'react'
import { TextField } from 'react-md'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'

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
      return <Title>Loading front desk data...</Title>
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
               value={config.greeting} onChange={updateConfig('greeting')} />
        <Field id="fd-introduction" label="Skills introduction"
               helpText="The usage explanation of each skill will be appended after this introduction"
               value={config.introduction} onChange={updateConfig('introduction')} />
        <Field id="fd-not-understood" label="Didn't understand message"
               value={config.not_understood} onChange={updateConfig('not_understood')} />
        <h4>
          Show when no skill claims more than &nbsp;
          <TextField id="fd-threshold"
                     type="number"
                     value={Math.round(config.threshold * 100) || 0}
                     min={0} max={100}
                     style={{width: "4em"}}
                     onChange={(value) => { updateConfig('threshold')(parseFloat(value) / 100) }}
                     fullWidth={false} inlineIndicator={<p>%</p>} />
          &nbsp; confidence
        </h4>
        <Field id="fd-clarification" label="Clarification message"
               helpText="Clarification messages for each matching skill will be appended after this message"
               value={config.clarification} onChange={updateConfig('clarification')} />
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
      data: frontDesk.data
    }
  } else {
    return {
      loaded: false,
      fetching: frontDesk.fetching,
      data: {}
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(frontDeskActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(FrontDesk)
