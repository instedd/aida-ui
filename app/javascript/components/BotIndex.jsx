import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { MainGrey } from '../ui/MainGrey'
import { Listing, Column } from '../ui/Listing'

import * as actions from '../actions/bots'
import * as routes from '../utils/routes'

import AppLayout from './AppLayout'

export class BotIndexComponent extends Component {
  componentDidMount() {
    this.props.actions.fetchBots()
  }

  render() {
    const { bots, history, actions } = this.props

    if (bots) {
      return <AppLayout title="Bots" buttonIcon="add" buttonAction={() => actions.createBot(history)}>
        <MainGrey>
          <Listing items={Object.values(bots)} title={`${Object.keys(bots).length} bots`}
            onItemClick={b => history.push(routes.bot(b.id))}>
            <Column title="Name" render={b => b.name} />
            <Column title="Type" render={b => "Facebook"} />
            <Column title="Uses" render={b => null} />
            <Column title="Last activity date" render={d => null} />
          </Listing>
        </MainGrey>
      </AppLayout>
    } else {
      return <AppLayout title="Bots"><p>Loading bots...</p></AppLayout>
    }
  }
}

const mapStateToProps = (state) => ({
  bots: state.bots.items
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
})

export const BotIndex = withRouter(connect(mapStateToProps, mapDispatchToProps)(BotIndexComponent))
