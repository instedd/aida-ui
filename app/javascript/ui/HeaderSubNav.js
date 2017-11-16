import React, { Component } from 'react';
import MenuButton from 'react-md/lib/Menus/MenuButton';
import Button from 'react-md/lib/Buttons/Button'
import * as Md from 'react-md';


export default class HeaderSubNav extends Component {
  render() {

    return (
        <nav className="mainTabs">
          <Md.Tabs id="tabs">
            <Md.Tab label="Analytics" active />
            <Md.Tab label="Data" />
            <Md.Tab label="Channels" />
            <Md.Tab label="Behaviour" />
            <Md.Tab label="Translations" />
            <Md.Tab label="Collaborators" />
          </Md.Tabs>

{/*          <div className='Tabs'>
            <MenuButton flat label="Analytics" id="analytics" />
            <MenuButton flat label="Data" id="data" />
            <MenuButton flat label="Channels" id="channels" />
            <MenuButton flat label="Behaviour" id="behaviour" />
            <MenuButton flat label="Translations" id="translations" />
            <MenuButton flat label="Collaborators" id="collaborators" />
            <MenuButton flat label={<i className='material-icons'>more_vert</i>} id="more" />
          </div>*/}
          <MenuButton
            id="more-menu"
            className="btn-more"
            buttonChildren="more_vert"
            label=""
            flat
            position={MenuButton.Positions.BELOW}
          >
            <Md.ListItem primaryText={<i className='material-icons dummy'>more_vert</i>} />
            <Md.ListItem primaryText="Item One" />
            <Md.ListItem primaryText="Item Two" />
            <Md.ListItem primaryText="Item Three" />
            <Md.ListItem primaryText="Item Four" />
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

