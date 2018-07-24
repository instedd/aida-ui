import React, { Component } from 'react'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import { connect } from 'react-redux'

import RelevanceField from './RelevanceField'
import sortBy from 'lodash/sortBy'

class KeywordResponder extends Component {
  render() {
    const { skill, actions, index } = this.props
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
               error={this.props.errors.filter((e) => e.path[0] == `skills/${index}` && e.path[1] == "explanation/en")} />
        <Field id="kr-clarification" label="Skill clarification"
               value={config.clarification} onChange={updateConfig('clarification')}
               error={this.props.errors.filter((e) => e.path[0] == `skills/${index}` && e.path[1] == "clarification/en")} />
        <Field id="kr-keywords" label="Valid keywords (comma separated)"
               value={config.keywords} onChange={updateConfig('keywords')}
               error={this.props.errors.filter((e) => e.path[0] == `skills/${index}` && e.path[1] == "keywords/en")} />
        <Field id="kr-response" label="Message"
               value={config.response} onChange={updateConfig('response')}
               error={this.props.errors.filter((e) => e.path[0] == `skills/${index}` && e.path[1] == "response/en")} />
      </div>
    )
  }
}

const mapStateToProps = (state, {skill}) => {
  return {
    errors: state.bots && state.bots.errors && state.bots.errors.filter((e) => e.path[0].startsWith("skills")) || [],
    index: sortBy(Object.values(state.skills.items), 'order').findIndex(s => s.id == skill.id)
  }
}

export default connect(mapStateToProps)(KeywordResponder)
