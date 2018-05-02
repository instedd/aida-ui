import React, { Component } from 'react'
import { SidebarItem, SidebarMenuItem } from '../ui/SideBar'
import includes from 'lodash/includes'
import { DragSource, DropTarget } from 'react-dnd'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from '../actions/skills'
import sortBy from 'lodash/sortBy'

const RENAMEABLE_SKILLS = ['keyword_responder', 'survey', 'scheduled_messages', 'decision_tree']
const isSkillRenameable = (kind) => includes(RENAMEABLE_SKILLS, kind)

const skillIcon = (kind) => {
  switch (kind) {
    case 'front_desk':
      return 'chat'
    case 'language_detector':
      return 'language'
    case 'keyword_responder':
      return 'reply'
    case 'survey':
      return 'assignment_turned_in'
    case 'scheduled_messages':
      return 'query_builder'
    case 'decision_tree':
      return 'device_hub'
    case 'ADD':
      return 'add'
  }
}

const skillItemSource = {
  beginDrag(props) {
    return {skill: props.skill.id};
  },

  endDrag(props, monitor, component) {
    const { skills, skill, questionnaireActions, actions, botId} = props

    if (monitor.didDrop()) {
      if (monitor.getDropResult().skill == 'front_desk') {
        actions.moveSkillToTop(botId, skills, skill, monitor.getDropResult().skill)
      } else {
        if (monitor.getDropResult().skill != null) {
          actions.moveSkill(botId, skills, skill, monitor.getDropResult().skill)
        }
      }
    }
  }
}

function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

export const skillItemTarget = {
  drop(props, monitor) {
    return { skill: props.skill }
  }
}

export const collectTarget = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }
}

class SkillListItem extends Component {
  draggableSkill() {
    const { skill, active, onClick, onToggleSkill, onDeleteSkill, onRenameSkill, connectDragSource, isDragging, isOver } = this.props
    let actionItems = []

    let draggableStyle: any = {
      opacity: isDragging ? 0.0 : 1,
      cursor: 'move'
    }

    if (isOver) {
      draggableStyle['borderBottom'] = '#212121 thin solid'
    }

    if (isSkillRenameable(skill.kind)) {
      actionItems.push(<SidebarMenuItem key={0}
                                 icon="edit"
                                 label="Rename"
                                 onClick={onRenameSkill} />)
    }
    actionItems.push(<SidebarMenuItem key={1}
                               icon="close"
                               label="Delete"
                               onClick={onDeleteSkill} />)

    const relevant = skill.config.relevant && !blank(skill.config.relevant)

    return connectDragSource(
      <div style={draggableStyle}>
        <SidebarItem id={`skill-${skill.id}`}
        icon={skillIcon(skill.kind)} label={skill.name}
        enabled={skill.enabled} active={active}
        className={`skill-item ${relevant ? "skill-item-relevant" : ""}`}
        onClick={onClick} onToggle={onToggleSkill} menuItems={actionItems} />
      </div>
    )
  }

  render() {
    const { connectDropTarget, skills } = this.props
    return connectDropTarget(this.draggableSkill())
  }
}

const mapStateToProps = (state) => {
  const { scope, items } = state.skills
  if (scope && items) {
    return {
      skills: sortBy(Object.values(items), 'order')
    }
  } else {
    return { skills: null }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

const source = DragSource('SKILL_ITEM', skillItemSource, collectSource)(SkillListItem)
const target = DropTarget('SKILL_ITEM', skillItemTarget, collectTarget)(source)

export default connect(mapStateToProps, mapDispatchToProps)(target)
