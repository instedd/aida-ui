import React, { Component } from 'react';
import ListItem from 'react-md/lib/Lists/ListItem';
import MenuButton from 'react-md/lib/Menus/MenuButton';


export default class UserMenu extends Component {

  render() {
    return (
      <MenuButton
        id="user-menu"
        buttonChildren="arrow_drop_down"
        label="Robert Stevenson"
        flat
        position={MenuButton.Positions.BELOW}
      >
        <ListItem primaryText="Item One" />
        <ListItem primaryText="Item Two" />
        <ListItem primaryText="Item Three" />
        <ListItem primaryText="Item Four" />
      </MenuButton>
    );
  }
}