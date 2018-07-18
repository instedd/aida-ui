import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Title from '../ui/Title'
import { Loader } from '../ui/Loader'

import * as routes from '../utils/routes'
import * as actions from '../actions/skill'

import KeywordResponder from './KeywordResponder'
import HumanOverride from './HumanOverride'
import LanguageDetector from './LanguageDetector'
import Survey from './Survey'
import ScheduledMessages from './ScheduledMessages'
import DecisionTree from './DecisionTree'

const SkillComponent = ({skill, actions}) => {
  const { kind } = skill

  switch (kind) {
    case 'keyword_responder':
      return (<KeywordResponder skill={skill} actions={actions} />)
    case 'human_override':
      return (<HumanOverride skill={skill} actions={actions} />)
    case 'language_detector':
      return (<LanguageDetector skill={skill} actions={actions} />)
    case 'survey':
      return (<Survey skill={skill} actions={actions} />)
    case 'scheduled_messages':
      return (<ScheduledMessages skill={skill} actions={actions} />)
    case 'decision_tree':
      return (<DecisionTree skill={skill} actions={actions} />)
    default:
      return (<Title>{skill.name} #{skill.id}</Title>)
  }
}

class BotSkill extends Component {
  render() {
    const { bot, skill, actions, loading } = this.props
    if (loading) {
      return <Loader>Loading skill</Loader>
    } else if (skill) {
      return <SkillComponent skill={skill} actions={actions}/>
    } else {
      return <Redirect to={routes.botFrontDesk(bot.id)} />
    }
  }
}

const mapStateToProps = (state, {skillId}) => {
  const { items } = state.skills
  if (items) {
    return { loading: false, skill: items[skillId], errors: state.bots.errors || state.chat.errors || [] }
  } else {
    return { loading: true, errors: [] }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(BotSkill)
