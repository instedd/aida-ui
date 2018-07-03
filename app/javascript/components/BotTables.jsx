import React, { Component } from 'react'
import {
  Button,
} from 'react-md'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Route } from 'react-router-dom'

import MainWhite from '../ui/MainWhite'
import Title from '../ui/Title'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'
import TablesIndex from './TablesIndex'
import TableView from './TableView'

import BotTranslationsMenu from './BotTranslationsMenu'
import * as actions from '../actions/tables'


class BotTables extends Component {
  componentDidMount() {
    const { permitted, actions, bot } = this.props

    if (permitted) {
      actions.fetchTables({ botId: bot.id })
    }
  }

  render() {
    const { permitted, bot, onToggleChatWindow } = this.props
    if (!permitted) {
      return <ContentDenied />
    }

    return (
      <MainWhite>
        <div className="translations-header">
          <div className="translations-title">
            <Title>Translations</Title>
          </div>
          <BotTranslationsMenu bot={bot} />
        </div>
        <br/>
        <Route exact path="/b/:id/translations/tables" render={() => <TablesIndex bot={bot} />} />
        <Route exact path="/b/:id/translations/tables/:table_id" render={({match}) => <TableView bot={bot} tableId={match.params.table_id} />} />
      </MainWhite>
    )
  }
}

const mapStateToProps = (state, { bot }) => {
  const permitted = hasPermission(bot, 'manages_variables')
  return {
    permitted,
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(BotTables)
