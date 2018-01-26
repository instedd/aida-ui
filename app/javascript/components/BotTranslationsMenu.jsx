import React, { Component } from 'react'
import { withRouter } from 'react-router'
import {Button} from 'react-md'
import { Link } from 'react-router-dom'
import { hasPermission } from '../utils'

import * as r from '../utils/routes'

const BotTranslationsMenu = ({location, bot}) => (
  <div className="translations-menu">
    <Button
      flat
      iconChildren="format_align_left"
      className={location.pathname == r.botTranslationsContent(bot.id) ? "active" : ""}
      disabled={!hasPermission(bot, 'manages_content')}
      to={r.botTranslationsContent(bot.id)}
      component={hasPermission(bot, 'manages_content') ? Link : null}>
      Content
    </Button>
    <Button
      flat
      iconChildren="code"
      className={location.pathname == r.botTranslationsVariables(bot.id) ? "active" : ""}
      disabled={!hasPermission(bot, 'manages_variables')}
      to={r.botTranslationsVariables(bot.id)}
      component={hasPermission(bot, 'manages_variables') ? Link : null}>
      Variables
    </Button>
    <Button
      flat
      iconChildren="view_list"
      className={location.pathname.startsWith(r.botTables(bot.id)) ? "active" : ""}
      disabled={!hasPermission(bot, 'manages_variables')}
      to={r.botTables(bot.id)}
      component={hasPermission(bot, 'manages_variables') ? Link : null}>
      Tables
    </Button>
  </div>
)

export default withRouter(BotTranslationsMenu)
