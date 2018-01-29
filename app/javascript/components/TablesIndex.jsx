import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, FontIcon } from 'react-md'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import values from 'lodash/values'
import sortBy from 'lodash/sortBy'
import moment from 'moment'

import NewTableDialog from './NewTableDialog'
import { Listing, ListingLoading, Column } from '../ui/Listing'

import * as actions from '../actions/tables'
import * as routes from '../utils/routes'

class TablesIndex extends Component {
  state = {
    dialogVisible: false
  }

  render() {
    const { fetching, bot, items, history, actions } = this.props

    const tables = sortBy(values(items), 'name')
    const title = tables.length == 1 ? "1 table" : `${tables.length} tables`

    if (fetching) {
      return <ListingLoading legend="Loading tables..." />
    } else {
      const showDialog = () => this.setState({ dialogVisible: true })
      const hideDialog = () => this.setState({ dialogVisible: false })
      const buttons = [
        <Button flat secondary className="table-header-button" onClick={showDialog}>Add table</Button>
      ]
      const addTable = (name, data) => {
        actions.createTable(bot.id, name, data)
        hideDialog()
      }
      return (
        <div>
          <Listing className="data-table-listing"
                   items={tables} title={title} actions={buttons}
                   onItemClick={item => history.push(routes.botTable(bot.id, item.id))}>
            <Column title="Name"     render={item => item.name} />
            <Column title="Columns"  render={item => item.columns.join(', ')} />
            <Column title="Uploaded" render={item => moment(item.updated_at).calendar()} />
          </Listing>
          <NewTableDialog visible={this.state.dialogVisible}
                          actions={actions}
                          onCancel={hideDialog}
                          onConfirm={addTable} />
        </div>
      )
    }
  }
}

const mapStateToProps = (state, { bot }) => {
  const { scope, fetching, items } = state.tables
  if (scope && scope.botId == bot.id) {
    return {
      fetching,
      items
    }
  } else {
    return {
      fetching: false,
      items: {}
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TablesIndex))
