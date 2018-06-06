import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { MainGrey } from '../ui/MainGrey'
import { Listing, Column } from '../ui/Listing'
import EmptyContent from '../ui/EmptyContent'
import Headline from '../ui/Headline'
import { EmptyLoader } from '../ui/Loader'

import * as actions from '../actions/bots'
import * as routes from '../utils/routes'

import AppLayout from './AppLayout'

import imgIcon from '../../assets/images/front-desk-icon.svg'

export class BotIndexComponent extends Component {
  componentDidMount() {
    this.props.actions.fetchBots()
  }

  render() {
    const { bots, history, actions } = this.props

    if (!bots) {
      return <AppLayout title="Bots"><EmptyLoader>Loading bots</EmptyLoader></AppLayout>
    } else {
      const botList = Object.values(bots)
      const createBot = () => actions.createBot(history)

      let content
      if (botList.length == 0) {
        content = (
           <EmptyContent imageSrc={imgIcon}>
             <Headline>
               You have no bots yet
               <span><a href="javascript:" onClick={createBot}>Create One</a></span>
             </Headline>
           </EmptyContent>
        )
      } else {
        const title = botList.length == 1 ? '1 bot' : `${botList.length} bots`
        content = (
           <Listing items={botList} title={title}
                    onItemClick={b => history.push(routes.bot(b.id))}>
             <Column title="Name" render={b => b.name} />
             <Column title="Type" render={b => "Facebook"} />
             <Column title="Uses" render={b => null} />
             <Column title="Last activity date" render={d => null} />
           </Listing>
        )
      }

      return <AppLayout title="Bots" buttonIcon="add" buttonAction={createBot}>
        <MainGrey>
          {content}
        </MainGrey>
      </AppLayout>
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
