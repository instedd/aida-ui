import React, { Component } from 'react';
import { Tabs, Tab, ListItem, MenuButton, Button } from 'react-md';

export default class HeaderSubNav extends Component {
  render() {
    const items = [
      <ListItem key={0} primaryText={<i className='material-icons dummy'>more_vert</i>} />,
      <ListItem key={1} primaryText="Item One" />,
      <ListItem key={2} primaryText="Item Two" />,
      <ListItem key={3} primaryText="Item Three" />,
      <ListItem key={4} primaryText="Item Four" />,
    ]

    return (
        <nav className="mainTabs">
          <Tabs tabId="mainTabs">
            <Tab label="Analytics" active />
            <Tab label="Data" />
            <Tab label="Channels" />
            <Tab label="Behaviour" />
            <Tab label="Translations" />
            <Tab label="Collaborators" />
          </Tabs>

          <MenuButton
            id="more-menu"
            className="btn-more"
            flat
            position={MenuButton.Positions.BELOW}
            menuItems={items}>
            <i className='material-icons dummy'>more_vert</i>
          </MenuButton>

          <Button
            onClick={this.props.onClick}
            floating
            secondary
            className="md-cell--right md-cell--bottom add-button">
            track_changes
          </Button>
        </nav>
    );
  }
}

