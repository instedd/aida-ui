import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Title from '../ui/Title'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as routes from '../utils/routes'

class BotSkill extends Component {
  render() {
    const { bot, skill, loading } = this.props
    if (loading) {
      return <Title>Loading skill...</Title>
    } else if (skill) {
      return <Title>{skill.name} #{skill.id}</Title>
    } else {
      return <Redirect to={routes.botFrontDesk(bot.id)} />
    }
  }
}

const mapStateToProps = (state, {skillId}) => {
  const { items } = state.skills
  if (items) {
    return { loading: false, skill: items[skillId] }
  } else {
    return { loading: true }
  }
}

const mapDispatchToProps = (dispatch) => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(BotSkill)
