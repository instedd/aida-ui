import React, { Component } from 'react'
import { SidebarItem, SidebarMenuItem } from '../ui/SideBar'
import { skillIcon, skillDnDType } from '../utils/skills_bar'
import { blank } from '../utils/string'
import includes from 'lodash/includes'
import { DragSource, DropTarget } from 'react-dnd'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from '../actions/skills'
import sortBy from 'lodash/sortBy'

const RENAMEABLE_SKILLS = ['keyword_responder', 'survey', 'scheduled_messages', 'decision_tree']
const isSkillRenameable = (kind) => includes(RENAMEABLE_SKILLS, kind)

const skillItemSource = {
  beginDrag(props) {
    return {skill: props.skill.id};
  },

  endDrag(props, monitor, component) {
    const { skills, skill, questionnaireActions, actions, botId} = props

    if (monitor.didDrop() && monitor.getDropResult().skill) {
      const targetSkill = monitor.getDropResult().skill
      if (targetSkill.kind == 'front_desk') {
        if (skill.order != skills[0].order) {
          actions.moveSkillToTop(botId, skills, skill, monitor.getDropResult().skill)
        }
      } else {
        if (skill.order != targetSkill.order && skill.order != (targetSkill.order + 1)) {
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
      <div className={(isOver ? 'drop-target' : '') + (isDragging ? ' dragging' : '')} >
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

const source = DragSource(skillDnDType, skillItemSource, collectSource)(SkillListItem)
const target = DropTarget(skillDnDType, skillItemTarget, collectTarget)(source)

export default connect(mapStateToProps, mapDispatchToProps)(target)
