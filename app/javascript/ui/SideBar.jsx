import React, { Component } from 'react';
import * as Md from 'react-md';

const Chat = () => <Md.FontIcon>chat</Md.FontIcon>;
const Add = () => <Md.FontIcon>add</Md.FontIcon>;

export const SideBar = ({children}) =>
  <div className='sidebar'>{children}</div>

export class SideBarDemo extends Component {
  render() {
    return (
      <SideBar>
        <Md.List className="skills-list">
          <Md.Subheader primaryText="Skills" className="heading-title" />
          <Md.Subheader primaryText="Add skills to your bot in order to make it more versatile" className="subheading-title" />
          <Md.ListItem
            leftIcon={<Chat />}
            primaryText="Front desk"
          />
          <Md.ListItemControl
            leftIcon={<Md.FontIcon key="language">flag</Md.FontIcon>}
            secondaryAction={
              <Md.Switch
                id="language"
                name="skills"
                label="Language detector"
                labelBefore
              />
            }
          />
          <Md.ListItemControl
            leftIcon={<Md.FontIcon key="feedback">loop</Md.FontIcon>}
            secondaryAction={
              <Md.Switch
                id="feedback"
                name="skills"
                label="Collect feedback"
                labelBefore
              />
            }
          />
          <Md.ListItemControl
            leftIcon={<Md.FontIcon key="geo-locator">place</Md.FontIcon>}
            secondaryAction={
              <Md.Switch
                id="geo-locator"
                name="skills"
                label="Geo-locator"
                labelBefore
              />
            }
          />
          <Md.ListItemControl
            leftIcon={<Md.FontIcon key="food-survey">assignment_turned_in</Md.FontIcon>}
            secondaryAction={
              <Md.Switch
                id="food-survey"
                name="skills"
                label="Food survey"
                labelBefore
              />
            }
          />
          <Md.ListItemControl
            leftIcon={<Md.FontIcon key="inactivity-check">query_builder</Md.FontIcon>}
            secondaryAction={
              <Md.Switch
                id="inactivity-check"
                name="skills"
                label="Inactivity check"
                labelBefore
              />
            }
          />
          <Md.ListItemControl
            leftIcon={<Md.FontIcon key="food-delivery">reply</Md.FontIcon>}
            secondaryAction={
              <Md.Switch
                id="food-delivery"
                name="skills"
                label="Food delivery"
                labelBefore
              />
            }
          />
          <Md.ListItemControl
            leftIcon={<Md.FontIcon key="dietary-recommendations">device_hub</Md.FontIcon>}
            secondaryAction={
              <Md.Switch
                id="dietary-recommendations"
                name="skills"
                label="Dietary recommendations"
                labelBefore
              />
            }
          />
          <Md.ListItemControl
            leftIcon={<Md.FontIcon key="external-service">power</Md.FontIcon>}
            secondaryAction={
              <Md.Switch
                id="external-service"
                name="skills"
                label="External service"
                labelBefore
              />
            }
          />
          <Md.ListItem
            leftIcon={<Add />}
            primaryText="Add skill"
            className="addlink"
          />
        </Md.List>
      </SideBar>
    );
  }
}

