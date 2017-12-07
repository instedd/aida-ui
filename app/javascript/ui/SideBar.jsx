import React, { Component } from 'react';
import { FontIcon, List, Subheader, Switch, ListItem, ListItemControl, MenuButton } from 'react-md'

export const SidebarMenuItem = ({icon, label}) => {
  return (<ListItem 
    leftIcon={<FontIcon>{icon}</FontIcon>}
    primaryText={label} />)
}

export const SidebarItem = ({id, icon, label, enabled, active, menu, items}) => {
  const itemClassActive = active ? "sidebar-item-active" : ""
  
  if (enabled != null) {
    const itemClassDisabled = enabled ? "" : "sidebar-item-disabled"
    const append = (<div className="sidebar-item-append">
      <Switch 
        id={id}
        name="skills"
        aria-label={label}
        labelBefore 
        checked={enabled} />
      <MenuButton className="btn-more" icon cascading
        id="sidebar-item-menu"
        onClick={(e) => e.stopPropagation()} 
        position={MenuButton.Positions.TOP_LEFT}
        anchor={{
          x: MenuButton.HorizontalAnchors.INNER_LEFT,
          y: MenuButton.VerticalAnchors.OVERLAP,
        }}
        menuItems={items} >
        more_vert
      </MenuButton>
    </div>)

    return (<ListItem
      className={itemClassActive + " " + itemClassDisabled}
      leftIcon={<FontIcon>{icon}</FontIcon>}
      primaryText={label}
      rightIcon={append}
    />)
  } else {
    return (<ListItem
      className={itemClassActive}
      leftIcon={<FontIcon>{icon}</FontIcon>}
      primaryText={label}
    />)
  }
}

export const SideBar = ({title, children}) =>
  <List className="sidebar">
    <Subheader primary primaryText={title} />
    {children}
  </List>

export default SideBar
