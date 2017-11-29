import React, { Component } from 'react'
import { FontIcon, List, Subheader, Switch, ListItem, ListItemControl } from 'react-md'
import { withRouter } from 'react-router'

import * as routes from '../utils/routes'

const Chat = () => <FontIcon>chat</FontIcon>;
const Add = () => <FontIcon>add</FontIcon>;
const Flag = () => <FontIcon>language</FontIcon>;
const Check = () => <FontIcon>assignment</FontIcon>;

class SkillsBar extends Component {
  render() {
    const { bot, history } = this.props

    return <div className="sidebar">
      <List className="skills-list">
        <Subheader primaryText="Skills" className="heading-title" />
        <ListItem leftIcon={<Chat />}
                  primaryText="Front desk"
                  onClick={() => history.push(routes.botFrontDesk(bot.id))}/>
        <ListItem leftIcon={<Flag />}
                  primaryText="Language detector"
                  rightIcon={<Switch name="lang" aria-label="toggle" id="toggle-lang-detector"/>}
                  onClick={() => history.push(routes.botSkill(bot.id, 1))} />
        <ListItem leftIcon={<Check />}
                  primaryText="Keyword responder"
                  rightIcon={<Switch name="keyword" aria-label="toggle" id="toggle-keyword-responder"/>}
                  onClick={() => history.push(routes.botSkill(bot.id, 2))}/>
        <ListItem leftIcon={<Add />}
                  primaryText="Add skill"
                  className="addlink" />
      </List>
    </div>
  }
}

export default withRouter(SkillsBar)
