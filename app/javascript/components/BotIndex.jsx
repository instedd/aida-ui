import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { MainWhite } from '../ui/MainWhite'
import { Listing, Column } from '../ui/Listing'
import EmptyContent from '../ui/EmptyContent'
import Headline from '../ui/Headline'
import { EmptyLoader } from '../ui/Loader'

import * as actions from '../actions/bots'
import * as botActions from '../actions/bot'
import * as routes from '../utils/routes'

import AppLayout from './AppLayout'

import imgIcon from '../../assets/images/front-desk-icon.svg'

export class BotIndexComponent extends Component {
  componentDidMount() {
    this.props.actions.fetchBots()
  }

  render() {
    const { bots, history, actions, botActions } = this.props

    if (!bots) {
      return <AppLayout title="Bots"><EmptyLoader>Loading bots</EmptyLoader></AppLayout>
    } else {
      const botList = Object.values(bots)
      const createBot = () => actions.createBot(history)
      const botClicked = (bot) => {
        history.push(routes.bot(bot.id))
        botActions.selectBot(bot)
      }

      let content
      if (botList.length == 0) {
        content = (
           <EmptyContent imageSrc={imgIcon}>
             <Headline>
               You have no bots yet
               <span><a href="javascript:" onClick={createBot} className="hrefLink">Create One</a></span>
             </Headline>
           </EmptyContent>
        )
      } else {
        const title = botList.length == 1 ? '1 bot' : `${botList.length} bots`

        const commaSeparatedChannels = channels => (
          channels.sort().map((channel, ix) => (
            ix > 0 ? `, ${channel}` : channel
          ))
        )

        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }

        content = (
          <MainWhite>
            <Listing items={botList} title={title}
                      onItemClick={b => botClicked(b)}>
              <Column title="Name" render={b => b.name} />
              <Column title="Type" render={b => commaSeparatedChannels(b.channels)} />
              <Column title="Uses" render={b => b.active_users} />
              <Column title="Last activity date" render={b => new Date(b.updated_at).toLocaleDateString('en-US', dateOptions)} />
            </Listing>
          </MainWhite>
        )
      }

      return <AppLayout title="Bots" buttonIcon="add" buttonAction={createBot}>
        {content}
      </AppLayout>
    }
  }
}

const mapStateToProps = (state) => ({
  bots: state.bots.items
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  botActions: bindActionCreators(botActions, dispatch),
})

export const BotIndex = withRouter(connect(mapStateToProps, mapDispatchToProps)(BotIndexComponent))
