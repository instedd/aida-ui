import React, { Component } from 'react'
import * as Md from 'react-md'

const Chat = () => <Md.FontIcon>chat</Md.FontIcon>;
const Add = () => <Md.FontIcon>add</Md.FontIcon>;

export default class SkillsBar extends Component {
  render() {
    return <div>
      <Md.List className="skills-list">
        <Md.Subheader primaryText="Skills" className="heading-title" />
        <Md.ListItem leftIcon={<Chat />} primaryText="Front desk" />
        <Md.ListItem leftIcon={<Add />} primaryText="Add skill" className="addlink" />
      </Md.List>
    </div>
  }
}
