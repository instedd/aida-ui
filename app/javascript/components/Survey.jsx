import React, { Component } from 'react'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'

export default class Survey extends Component {
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
        <Title>Survey</Title>
        <Headline>
          Ask and discover users needs and interests.
        </Headline>
      </div>
    )
  }
}

