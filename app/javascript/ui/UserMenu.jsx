import React, { Component } from 'react'
import { ListItem, MenuButton, FontIcon, IconSeparator } from 'react-md';

export default class UserMenu extends Component {

  render() {
    const items = [
      <ListItem key={0} primaryText="Item One" />,
      <ListItem key={1} primaryText="Item Two" />,
      <ListItem key={2} primaryText="Item Three" />,
      <ListItem key={3} primaryText="Item Four" />,
    ]

    return (
      <MenuButton
        id="user-menu"
        flat
        position={MenuButton.Positions.BELOW}
        menuItems={items}>
        <IconSeparator label="Robert Stevenson">
          <FontIcon>arrow_drop_down</FontIcon>
        </IconSeparator>
      </MenuButton>
    );
  }
}
