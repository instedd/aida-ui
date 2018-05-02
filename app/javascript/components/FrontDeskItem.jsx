import React, { Component } from 'react'
import SideBar, { SidebarItem, SidebarMenuItem } from '../ui/SideBar'
import * as routes from '../utils/routes'
import { DropTarget } from 'react-dnd'

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

class FrontDeskItem extends Component {
  render() {
    const { bot, connectDropTarget, isOver, isDragging } = this.props

    let draggableStyle: any = {
      opacity: isDragging ? 0.0 : 1,
      cursor: 'move'
    }

    if (isOver) {
      draggableStyle['borderBottom'] = '#212121 thin solid'
    }

    return connectDropTarget(<div style={draggableStyle}><SidebarItem icon={skillIcon('front_desk')}
      label="Front desk"
      active={location.pathname == routes.botFrontDesk(bot.id)}
      onClick={() => history.push(routes.botFrontDesk(bot.id))}/></div>)
  }
}

export default DropTarget('SKILL_ITEM', skillItemTarget, collectTarget)(FrontDeskItem)
