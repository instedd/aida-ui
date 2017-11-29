import React, { Component } from 'react'
import Title from '../ui/Title'

export default class BotSkill extends Component {
  render() {
    const { skillId } = this.props
    return <Title>Loading skill {skillId}</Title>
  }
}
