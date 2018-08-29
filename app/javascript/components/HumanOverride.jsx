import React, { Component } from 'react'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import TimezoneDropdown from '../ui/TimezoneDropdown'
import WeeklySchedule from '../ui/WeeklySchedule'
import KeywordInput from '../ui/KeywordInput'

import RelevanceField from './RelevanceField'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { hasPermission } from '../utils'
import * as collaboratorsActions from '../actions/collaborators'
import * as r from '../utils/routes'
import { Button } from 'react-md'
import { Link } from 'react-router-dom'

class HumanOverride extends Component {
  componentDidMount() {
    const { permitted, bot, collaboratorsActions } = this.props
    if (permitted) {
      collaboratorsActions.fetchCollaborators({ botId: bot.id })
    }
  }

  render() {
    const { skill, actions, errors, permitted, operators, bot, botActions } = this.props
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

    const operatorField = () => {
      const spaceSeparatedOperators = () => (
        operators ?
          operators.sort().map(
            (operator, ix) => {
              return ix > 0 ? ` ${operator.display_name}` : operator.display_name
            }
          ).toString() : null
      )

      if (permitted) {
        
        return (
          <div className="md-text-field-container md-full-width md-text-field-container--input ui-field">
            <label className="md-floating-label md-floating-label--floating md-text--secondary">Operators</label>
            
            <div className="operators-list-field">
              {operators.length
              ? spaceSeparatedOperators()
              : <span>You don't have any operators yet</span>
              }
            </div>
            <Button
              flat
              iconChildren="edit"
              className="btnLink pull-right"
              to={r.botCollaborators(bot.id)}
              component={Link} >
              Manage permissions
            </Button>
          </div>
        )
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
        <KeywordInput actions={botActions} bot={bot} onKeywordChange={updateConfig('keywords')} keywords={config.keywords} errors={errors}/>

        <TimezoneDropdown value={config.timezone} onChange={updateConfig('timezone')} />
        <WeeklySchedule hours={config.hours} onChange={updateConfig('hours')}/>

        <Field id="kr-in-hours-response" label="Within schedule message"
               value={config.in_hours_response} onChange={updateConfig('in_hours_response')}
               error={errors.filter(e => e.path[1] == "in_hours_response/en")} />
        <Field id="kr-off-hours-response" label="Outside schedule message"
               value={config.off_hours_response} onChange={updateConfig('off_hours_response')}
               error={errors.filter(e => e.path[1] == "off_hours_response/en")} />
        {operatorField()}
      </div>
    )
  }
}

const mapStateToProps = (state, {bot}) => {
  const { fetching, scope, data } = state.collaborators
  const permitted = hasPermission(bot, 'can_admin')
  if (!data || fetching || bot.id != scope.botId) {
    return {
      permitted,
      operators: []
    }
  } else {
    return {
      permitted,
      operators: data.collaborators.filter(collaborator => collaborator.roles.some(rol => rol == 'operator'))
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  collaboratorsActions: bindActionCreators(collaboratorsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(HumanOverride)
