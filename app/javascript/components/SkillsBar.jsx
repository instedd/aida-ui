import React, { Component } from 'react'
import { FontIcon, List, Subheader, Switch, ListItem, ListItemControl } from 'react-md'

const Chat = () => <FontIcon>chat</FontIcon>;
const Add = () => <FontIcon>add</FontIcon>;
const Flag = () => <FontIcon>language</FontIcon>;
const Check = () => <FontIcon>assignment</FontIcon>;

export default class SkillsBar extends Component {
  render() {
    return <div className="sidebar">
      <List className="skills-list">
        <Subheader primaryText="Skills" className="heading-title" />
        <ListItem leftIcon={<Chat />} primaryText="Front desk" />
        <ListItem leftIcon={<Flag />} primaryText="Language detector" rightIcon={<Switch name="lang" aria-label="toggle" id="toggle-lang-detector"/>} />
        <ListItem leftIcon={<Check />} primaryText="Keyword responder" rightIcon={<Switch name="keyword" aria-label="toggle" id="toggle-keyword-responder"/>} />
        <ListItem leftIcon={<Add />} primaryText="Add skill" className="addlink" />
      </List>
    </div>
  }
}
