import React, { Component } from 'react'
import SideBar, { SidebarItem, SidebarMenuItem } from '../ui/SideBar'
import * as routes from '../utils/routes'
import { skillDnDType } from '../utils/skills_bar'
import { DropTarget } from 'react-dnd'
import classNames from 'classnames/bind'

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
    const { bot, icon, onClick, connectDropTarget, isOver, isDragging, hasError } = this.props

    return connectDropTarget(
      <div className={classNames({ 'frontDeskItem': true, 'drop-target': isOver })} >
        <SidebarItem icon={icon}
          label="Front desk"
          active={location.pathname == routes.botFrontDesk(bot.id)}
          onClick={onClick}
          hasError={hasError} />
      </div>
    )
  }
}

export default DropTarget(skillDnDType, skillItemTarget, collectTarget)(FrontDeskItem)
