import React, { Component } from 'react'
import { FontIcon,
         DialogContainer,
         Button,
         TextField,
         List,
         Subheader,
         Switch,
         ListItem,
         ListItemControl,
         DropdownMenu,
         Menu,
         MenuButton
} from 'react-md'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import sortBy from 'lodash/sortBy'
import includes from 'lodash/includes'

import * as routes from '../utils/routes'
import * as actions from '../actions/skills'
import * as skillActions from '../actions/skill'

const SKILL_KINDS = ['language_detector', 'keyword_responder']
const RENAMEABLE_SKILLS = ['keyword_responder']

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

const skillDescription = (kind) => {
  switch (kind) {
    case 'keyword_responder':
      return 'This skill will let your users query for information using simple keywords'
    default:
      return ''
  }
}

const isSkillRenameable = (kind) => includes(RENAMEABLE_SKILLS, kind)


const SkillListItem = ({skill, onClick, onToggleSkill, onDeleteSkill, onRenameSkill}) => {
  const toggleId = `toggle-skill-${skill.id}`
  const menuId = `menu-skill-${skill.id}`
  let actionItems = []
  if (isSkillRenameable(skill.kind)) {
    actionItems.push(<ListItem key={0}
                               leftIcon={<FontIcon>edit</FontIcon>}
                               primaryText="Rename"
                               onClick={() => onRenameSkill(skill)} />)
  }
  actionItems.push(<ListItem key={1}
                             leftIcon={<FontIcon>close</FontIcon>}
                             primaryText="Delete"
                             onClick={() => onDeleteSkill(skill)}/>)

  const skillControls = (
    <div style={{display: 'flex'}}>
      <Switch id={toggleId}
              name={toggleId}
              aria-label="toggle"
              checked={skill.enabled}
              onChange={() => onToggleSkill(skill)}
              onClick={(e) => e.stopPropagation() }/>
      <MenuButton
        id={menuId}
        className="btn-more"
        flat
        cascading
        onClick={(e) => e.stopPropagation()}
        position={MenuButton.Positions.BELOW}
        menuItems={actionItems}>
        <i className='material-icons dummy'>more_vert</i>
      </MenuButton>
    </div>
  )
  return (<ListItem leftIcon={skillIcon(skill.kind)}
                    primaryText={skill.name}
                    rightIcon={skillControls}
                    onClick={onClick} />)
}

class SkillNameDialog extends Component {
  state = {
    name: ''
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      const name = nextProps.skill && (nextProps.skill.name || defaultSkillName(nextProps.skill.kind))
      this.setState({name})
    }
  }

  render() {
    const { visible, skill, onClose, onSubmit } = this.props
    const isNewSkill = !skill || !skill.id
    const kind = skill && skill.kind

    const actions = [
      { secondary: true, children: 'Cancel', onClick: onClose },
      (<Button flat primary onClick={() => onSubmit(this.state.name)}>{isNewSkill ? 'Add' : 'Rename'}</Button>)
    ]
    const dialogTitle = isNewSkill ? (defaultSkillName(kind) || 'Add skill') : 'Rename skill'
    const dialogDescription = isNewSkill ? skillDescription(kind) : ''

    return (
      <DialogContainer
        id="skill-name-dialog"
        visible={visible}
        onHide={onClose}
        actions={actions}
        title={dialogTitle}>
        <h4>{dialogDescription}</h4>
        <TextField id="skill-name-field"
                   label="Skill name"
                   value={this.state.name}
                   onChange={(name) => this.setState({name})} />
      </DialogContainer>
    )
  }
}

class SkillsBar extends Component {
  state = {
    dialogSkill: null
  }

  componentDidMount() {
    const { skills, bot, actions } = this.props
    if (!skills) {
      actions.fetchSkills({botId: bot.id})
    }
  }

  render() {
    const { bot, skills, creating, history, actions, skillActions } = this.props
    const { dialogSkill } = this.state
    const dialogVisible = !!dialogSkill

    const skillsItems = skills
                      ? skills.map(skill => (
                        <SkillListItem skill={skill} key={skill.id}
                                       onClick={() => history.push(routes.botSkill(bot.id, skill.id))}
                                       onToggleSkill={(skill) => skillActions.toggleSkill(skill)}
                                       onRenameSkill={(skill) => openDialog(skill)}
                                       onDeleteSkill={(skill) => skillActions.deleteSkill(skill)} />
                      ))
                      : [<ListItem key="loading"
                                   leftIcon={skillIcon('LOADING')}
                                   primaryText="Loading skills..." />]

    const skillKindItems = SKILL_KINDS.map(kind => ({
      key: kind,
      primaryText: defaultSkillName(kind),
      leftIcon: skillIcon(kind),
      onClick: () => {
        if (isSkillRenameable(kind)) {
          openDialog({ kind, name: defaultSkillName(kind) })
        } else {
          actions.createSkill({botId: bot.id}, {kind}, history)
        }
      }
    }))

    const openDialog = (skill) => {
      this.setState({ dialogSkill: skill })
    }

    const closeDialog = () => {
      this.setState({ dialogSkill: null })
    }

    const dialogSubmit = (name) => {
      const { dialogSkill } = this.state
      if (dialogSkill && dialogSkill.kind) {
        const { kind, id } = dialogSkill
        if (id) {
          skillActions.updateSkill({...dialogSkill, name})
        } else {
          actions.createSkill({botId: bot.id}, {kind, name}, history)
        }
      }
      closeDialog()
    }

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

        <SkillNameDialog visible={dialogVisible}
                         skill={dialogSkill}
                         onClose={closeDialog}
                         onSubmit={dialogSubmit} />
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
