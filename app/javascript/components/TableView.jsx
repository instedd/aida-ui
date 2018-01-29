import React, { Component } from 'react'
import { Button, FontIcon, TextField } from 'react-md'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import size from 'lodash/size'
import map from 'lodash/map'
import humps from 'humps'

import { Listing, ListingLoading, Column } from '../ui/Listing'

import * as actions from '../actions/tables'
import * as routes from '../utils/routes'

class TableView extends Component {
  componentDidMount() {
    const { actions, tableId, bot } = this.props
    actions.fetchTable(bot.id, tableId)
  }

  render() {
    const { fetching, bot, items, table, actions, history } = this.props

    if (fetching || !table) {
      return <ListingLoading legend="Loading table..." />
    } else {
      const tableCount = size(items)
      const parentTitle = tableCount == 1 ? "1 table" : `${tableCount} tables`
      const data = table.data ? table.data.slice(1) : []
      const columns = map(table.columns || [], (column, index) => {
        const colTitle = index == 0
                       ? (<span><b>{column}</b><sup>KEY</sup></span>)
                       : column
        return (<Column key={index} title={colTitle} render={item => item[index]} />)
      })
      const keyColumn = humps.camelize(table.columns[0])
      const lookupColumn = table.columns[1]
      const sampleUsage = `{{lookup($\{${keyColumn}\}), "${table.name}", "${lookupColumn}"}}`
      const title = (
        <div>
          <span className="link" onClick={() => history.replace(routes.botTables(bot.id))}>{parentTitle}</span>
          <FontIcon className="separator">chevron_right</FontIcon>
          {table.name}
        </div>
      )
      const destroyTable = () => {
        actions.destroyTable(table.id)
        history.replace(routes.botTables(bot.id))
      }
      const buttons = (
        <div className="data-table-header">
          <TextField id="table-usage-example"
                     className="example"
                     leftIcon={<FontIcon>info</FontIcon>}
                     value={sampleUsage}
                     onChange={() => null} />
          <div className="actions">
            <Button icon onClick={() => null}>file_download</Button>
            <Button icon onClick={() => null}>refresh</Button>
            <Button icon onClick={destroyTable}>delete</Button>
          </div>
        </div>
      )

      return (
        <Listing className="data-table-listing"
                 items={data}
                 actions={buttons}
                 title={title}>
          {columns}
        </Listing>
      )
    }
  }
}

const mapStateToProps = (state, { bot, tableId }) => {
  const { scope, fetching, items } = state.tables
  if (scope && scope.botId == bot.id) {
    const table = items[tableId]
    return {
      fetching,
      table,
      items
    }
  } else {
    return {
      fetching: false,
      table: null,
      items: {}
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TableView))
