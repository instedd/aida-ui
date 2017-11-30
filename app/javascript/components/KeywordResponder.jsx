import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'

import * as actions from '../actions/skill'

class KeywordResponder extends Component {
  render() {
    const { skill, actions } = this.props
    const { name, config } = skill

    const updateConfig = (key) => {
      return (value) => {
        actions.updateSkill({
          ...skill,
          config: {
            ...skill.config,
            [key]: value
          }
        })
      }
    }

    return (
      <div>
        <Title>{name}</Title>
        <Headline>
          When a message sent by the user contains one of the keywords this
          skill responds with the predefined message
        </Headline>

        <Field id="kr-explanation" label="Skill explanation"
               value={config.explanation} onChange={updateConfig('explanation')} />
        <Field id="kr-clarification" label="Skill clarification"
               value={config.clarification} onChange={updateConfig('clarification')} />
        <Field id="kr-keywords" label="Valid keywords (comma separated)"
               value={config.keywords} onChange={updateConfig('keywords')} />
        <Field id="kr-response" label="Message"
               value={config.response} onChange={updateConfig('response')} />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(KeywordResponder)
