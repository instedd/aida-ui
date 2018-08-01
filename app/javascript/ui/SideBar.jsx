import React, { Component } from 'react';
import { FontIcon, List, Subheader, Switch, ListItem, ListItemControl, MenuButton } from 'react-md'

export const SidebarMenuItem = ({icon, label, onClick}) => {
  return (<ListItem
    leftIcon={<FontIcon>{icon}</FontIcon>}
    primaryText={label}
    onClick={onClick} />)
}

export const SidebarItem = ({id, className, icon, label, enabled, active, menuItems, onClick, onToggle, hasError}) => {
  const itemClassActive = active ? "sidebar-item-active" : ""
  let error = ""
  if(hasError) {
    error = (<FontIcon className="error-in-sidebar">lens</FontIcon>)
  }

  if (enabled != null) {
    const itemClassDisabled = enabled ? "" : "sidebar-item-disabled"
    const append = (<div className="sidebar-item-append">
      {error}
      <Switch
        id={id}
        name="skills"
        aria-label={label}
        labelBefore
        checked={enabled}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        />
      <MenuButton className="btn-more" icon cascading
        id={id + "-menu"}
        onClick={(e) => e.stopPropagation()}
        position={MenuButton.Positions.TOP_LEFT}
        anchor={{
          x: MenuButton.HorizontalAnchors.INNER_LEFT,
          y: MenuButton.VerticalAnchors.OVERLAP,
        }}
        menuItems={menuItems} >
        more_vert
      </MenuButton>
    </div>)

    return (<ListItem
      className={(className || "") + " " + itemClassActive + " " + itemClassDisabled}
      leftIcon={<FontIcon>{icon}</FontIcon>}
      primaryText={label}
      rightIcon={append}
      onClick={onClick}
    />)
  } else {
    return (<ListItem
      className={(className || "") + " " + itemClassActive}
      leftIcon={<FontIcon>{icon}</FontIcon>}
      primaryText={label}
      onClick={onClick}
    />)
  }
}

export const SideBar = ({title, children}) =>
  <List className="sidebar">
    <Subheader primary primaryText={title} />
    {children}
  </List>

export default SideBar
