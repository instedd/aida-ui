import React, { Component } from 'react'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'

import RelevanceField from './RelevanceField'

export default class HumanOverride extends Component {
  render() {
    const { skill, actions, errors } = this.props
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
        <Title>Human override</Title>
        <Headline>
          When a message contains one of the keywords, this skill will forward
          the conversation to a human operator
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
               error={errors.filter(e => e.path[1] == "keywords/en")} />
        <Field id="kr-in-hours-response" label="Within schedule message"
               value={config.in_hours_response} onChange={updateConfig('in_hours_response')}
               error={errors.filter(e => e.path[1] == "in_hours_response/en")} />
        <Field id="kr-off-hours-response" label="Outside schedule message"
               value={config.off_hours_response} onChange={updateConfig('off_hours_response')}
               error={errors.filter(e => e.path[1] == "off_hours_response/en")} />
      </div>
    )
  }
}
