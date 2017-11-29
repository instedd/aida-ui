import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Title from '../ui/Title'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import maxBy from 'lodash/maxBy'

import * as routes from '../utils/routes'

class BotSkill extends Component {
  render() {
    const { bot, skill, skillId } = this.props
    if (skillId == 'new') {
      if (skill) {
        return <Redirect to={routes.botSkill(bot.id, skill.id)} />
      } else {
        return <Title>Adding skill...</Title>
      }
    } else if (skill) {
      return <Title>{skill.name}</Title>
    } else {
      return <Title>Loading skill...</Title>
    }
  }
}

const mapStateToProps = (state, {skillId}) => {
  const { items, creating } = state.skills
  if (skillId == 'new') {
    if (creating || !items) {
      return { skill: null, creating }
    } else {
      return { skill: maxBy(Object.values(items), 'order') }
    }
  } else if (items) {
    return { skill: items[skillId] }
  }
}

const mapDispatchToProps = (dispatch) => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(BotSkill)
