import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ListItem, MenuButton, FontIcon, IconSeparator } from 'react-md'
import { Link } from 'react-router-dom'

export class UserMenu extends Component {
  static propTypes = {
    userName: PropTypes.string.isRequired,
  }

  render() {
    const {userName, items} = this.props

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

export default UserMenu

export const UserMenuLink = ({label, to}) => <ListItem component={Link} primaryText={label} to={to} />

export const UserMenuAnchor = ({label, href}) => <ListItem component="a" primaryText={label} href={href} />
