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
import sortBy from 'lodash/sortBy'

const SkillComponent = ({skill, actions, errors}) => {
  const { kind } = skill

  switch (kind) {
    case 'keyword_responder':
      return (<KeywordResponder skill={skill} actions={actions} errors={errors} />)
    case 'human_override':
      return (<HumanOverride skill={skill} actions={actions} errors={errors} />)
    case 'language_detector':
      return (<LanguageDetector skill={skill} actions={actions} errors={errors} />)
    case 'survey':
      return (<Survey skill={skill} actions={actions} errors={errors} />)
    case 'scheduled_messages':
      return (<ScheduledMessages skill={skill} actions={actions} errors={errors} />)
    case 'decision_tree':
      return (<DecisionTree skill={skill} actions={actions} errors={errors} />)
    default:
      return (<Title>{skill.name} #{skill.id}</Title>)
  }
}

class BotSkill extends Component {
  render() {
    const { bot, skill, actions, loading, errors } = this.props

    if (loading) {
      return <Loader>Loading skill</Loader>
    } else if (skill) {
      return <SkillComponent skill={skill} actions={actions} errors={errors}/>
    } else {
      return <Redirect to={routes.botFrontDesk(bot.id)} />
    }
  }
}

const mapStateToProps = (state, {skillId, errors}) => {
  const { items } = state.skills
  if (items) {
    const errorIndex = sortBy(Object.values(items).filter(skill => skill.enabled), 'order').findIndex(skill => skill.id == skillId)
    return {
      loading: false,
      skill: items[skillId],
      errors: errors.filter(e => e.path[0] == `skills/${errorIndex}`)
    }
  } else {
    return { loading: true }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(BotSkill)
