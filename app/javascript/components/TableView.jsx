import React, { Component } from 'react'
import { FontIcon } from 'react-md'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import size from 'lodash/size'
import map from 'lodash/map'

import { Listing, ListingLoading, Column } from '../ui/Listing'

import * as actions from '../actions/tables'
import * as routes from '../utils/routes'

class TableView extends Component {
  componentDidMount() {
    const { actions, tableId, bot } = this.props
    actions.fetchTable(bot.id, tableId)
  }

  render() {
    const { fetching, bot, items, table, history } = this.props

    if (fetching || !table) {
      return <ListingLoading legend="Loading table..." />
    } else {
      const tableCount = size(items)
      const title = tableCount == 1 ? "1 table" : `${tableCount} tables`
      const data = table.data ? table.data.slice(1) : []
      const columns = map(table.columns || [], (column, index) => {
        const colTitle = index == 0
                       ? (<span><b>{column}</b><sup>KEY</sup></span>)
                       : column
        return (<Column key={index} title={colTitle} render={item => item[index]} />)
      })
      return (
        <Listing className="data-table-listing"
                 items={data}
                 title={
                   <div>
                     <span className="link" onClick={() => history.replace(routes.botTables(bot.id))}>{title}</span>
                     <FontIcon className="separator">chevron_right</FontIcon>
                     {table.name}
                   </div>
                 }>
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
