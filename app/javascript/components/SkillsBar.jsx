import React, { Component } from 'react'
import { FontIcon, List, Subheader, Switch, ListItem, ListItemControl, DropdownMenu, Menu, MenuButton } from 'react-md'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import sortBy from 'lodash/sortBy'

import * as routes from '../utils/routes'
import * as actions from '../actions/skills'
import * as skillActions from '../actions/skill'

const skillIcon = (kind) => {
  switch (kind) {
    case 'front_desk':
      return (<FontIcon>chat</FontIcon>)
    case 'language_detector':
      return (<FontIcon>language</FontIcon>)
    case 'keyword_responder':
      return (<FontIcon>assignment</FontIcon>)
    case 'ADD':
      return (<FontIcon>add</FontIcon>)
  }
}

const defaultSkillName = (kind) => {
  switch (kind) {
    case 'language_detector':
      return 'Language detector'
    case 'keyword_responder':
      return 'Keyword responder'
  }
}

const SkillListItem = ({skill, onClick, actions}) => {
  const toggleId = `toggle-skill-${skill.id}`
  const menuId = `menu-skill-${skill.id}`
  const skillActionItems = [
    <ListItem key={0}
              leftIcon={<FontIcon>edit</FontIcon>}
              primaryText="Rename"
              onClick={() => null} />,
    <ListItem key={1}
              leftIcon={<FontIcon>close</FontIcon>}
              primaryText="Delete"
              onClick={() => actions.deleteSkill(skill) }/>,
  ]
  const skillControls = (
    <div style={{display: 'flex'}}>
      <Switch id={toggleId}
              name={toggleId}
              aria-label="toggle"
              checked={skill.enabled}
              onChange={() => actions.toggleSkill(skill)}
              onClick={(e) => e.stopPropagation() }/>
      <MenuButton
        id={menuId}
        className="btn-more"
        flat
        cascading
        onClick={(e) => e.stopPropagation()}
        position={MenuButton.Positions.BELOW}
        menuItems={skillActionItems}>
        <i className='material-icons dummy'>more_vert</i>
      </MenuButton>
    </div>
  )
  return (<ListItem leftIcon={skillIcon(skill.kind)}
                    primaryText={skill.name}
                    rightIcon={skillControls}
                    onClick={onClick} />)
}

class SkillsBar extends Component {
  componentDidMount() {
    const { skills, bot, actions } = this.props
    if (!skills) {
      actions.fetchSkills({botId: bot.id})
    }
  }

  render() {
    const { bot, skills, creating, history, actions, skillActions } = this.props

    const skillsItems = skills
                      ? skills.map(skill => (
                        <SkillListItem skill={skill} key={skill.id} actions={skillActions}
                                       onClick={() => history.push(routes.botSkill(bot.id, skill.id))} />
                      ))
                      : [<ListItem key="loading"
                                   leftIcon={skillIcon('LOADING')}
                                   primaryText="Loading skills..." />]

    const skillKindItems = ['language_detector', 'keyword_responder'].map(kind => ({
      key: kind,
      primaryText: defaultSkillName(kind),
      leftIcon: skillIcon(kind),
      onClick: () => {
        actions.createSkill({botId: bot.id}, kind, history)
      }
    }))

    return (
      <div className="sidebar">
        <List className="skills-list">
          <Subheader primaryText="Skills" className="heading-title" />
          <ListItem leftIcon={skillIcon('front_desk')}
                    primaryText="Front desk"
                    onClick={() => history.push(routes.botFrontDesk(bot.id))}/>
          {skillsItems}
          <DropdownMenu id="add-skill-menu"
                        cascading
                        block={true}
                        anchor={{x: DropdownMenu.HorizontalAnchors.INNER_LEFT, y: DropdownMenu.VerticalAnchors.OVERLAP}}
                        position={DropdownMenu.Positions.TOP_LEFT}
                        menuItems={skillKindItems}>
            <ListItem id="add-skill"
                      leftIcon={skillIcon('ADD')}
                      primaryText="Add skill"
                      className="addlink"
                      onClick={(e) => e.stopPropagation() }/>
          </DropdownMenu>
        </List>
      </div>
    )
  }
}

const mapStateToProps = (state, {bot}) => {
  const { scope, items, creating } = state.skills
  if (scope && scope.botId == bot.id && items) {
    return {
      skills: sortBy(Object.values(items), 'order'),
      creating
    }
  } else {
    return { skills: null }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  skillActions: bindActionCreators(skillActions, dispatch)
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SkillsBar))
