import React, { Component } from 'react'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import KeywordInput from '../ui/KeywordInput'

import RelevanceField from './RelevanceField'

export default class KeywordResponder extends Component {
  render() {
    const { skill, actions, errors, bot, botActions } = this.props
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
               error={errors.filter(e => e.path[1] == "explanation/en")} />
        <Field id="kr-clarification" label="Skill clarification"
               value={config.clarification} onChange={updateConfig('clarification')}
               error={errors.filter(e => e.path[1] == "clarification/en")} />
        <Field id="kr-keywords" label="Valid keywords (comma separated)"
               value={config.keywords} onChange={updateConfig('keywords')}
               error={errors.filter(e => e.path[1].startsWith("keywords/en"))} />
        <KeywordInput actions={botActions} bot={bot} />
        <Field id="kr-response" label="Message"
               value={config.response} onChange={updateConfig('response')}
               error={errors.filter(e => e.path[1] == "response/en")} />
      </div>
    )
  }
}
