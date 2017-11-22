import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ListItem, MenuButton, FontIcon, IconSeparator } from 'react-md'

export default class UserMenu extends Component {
  static propTypes = {
    userName: PropTypes.string.isRequired,
    logoutUrl: PropTypes.string.isRequired
  }

  render() {
    const {userName, logoutUrl} = this.props

    const items = [
      <ListItem key={0} component="a" primaryText="Sign out" href={logoutUrl} />,
    ]

    return (
      <MenuButton
        id="user-menu"
        flat
        position={MenuButton.Positions.BELOW}
        menuItems={items}>
        <IconSeparator label={userName}>
          <FontIcon>arrow_drop_down</FontIcon>
        </IconSeparator>
      </MenuButton>
    );
  }
}
