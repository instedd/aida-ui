import React, { Component } from 'react'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import { connect } from 'react-redux'

import RelevanceField from './RelevanceField'

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
        <Title>Keyword responder</Title>
        <Headline>
          When a message sent by the user contains one of the keywords, this
          skill responds with the predefined message
        </Headline>

        <RelevanceField value={config.relevant} onChange={updateConfig('relevant')} />

        <Field id="kr-explanation" label="Skill explanation"
               value={config.explanation} onChange={updateConfig('explanation')}
               error={this.props.errors.filter((e) => e.path[0] == `skills/${skill.order}` && e.path[1] == "explanation/en")} />
        <Field id="kr-clarification" label="Skill clarification"
               value={config.clarification} onChange={updateConfig('clarification')}
               error={this.props.errors.filter((e) => `skills/${skill.order}` && e.path[1] == "clarification/en")} />
        <Field id="kr-keywords" label="Valid keywords (comma separated)"
               value={config.keywords} onChange={updateConfig('keywords')}
               error={this.props.errors.filter((e) => `skills/${skill.order}` && e.path[1] == "keywords/en")} />
        <Field id="kr-response" label="Message"
               value={config.response} onChange={updateConfig('response')}
               error={this.props.errors.filter((e) => `skills/${skill.order}` && e.path[1] == "response/en")} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    errors: state.bots && state.bots.errors && state.bots.errors.filter((e) => e.path[0].startsWith("skills"))
      || state.chat && state.chat.errors && state.chat.errors.filter((e) => e.path[0].startsWith("skills")) || []
  }
}

const mapDispatchToProps = (dispatch) => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(KeywordResponder)
