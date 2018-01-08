import React, { Component } from 'react'
import { withRouter } from 'react-router'
import {Button} from 'react-md'
import { Link } from 'react-router-dom'

import * as r from '../utils/routes'

const BotTranslationsMenu = ({location, bot}) =>
  <div className="translations-menu">
    <Button
      flat
      iconChildren="format_align_left"
      className={location.pathname == r.botTranslationsContent(bot.id) ? "active" : ""}
      to={r.botTranslationsContent(bot.id)}
      component={Link}>
      Content
    </Button>
    <Button
      flat
      iconChildren="code"
      className={location.pathname == r.botTranslationsVariables(bot.id) ? "active" : ""}
      to={r.botTranslationsVariables(bot.id)}
      component={Link}>
      Variables
    </Button>
  </div>

export default withRouter(BotTranslationsMenu)
