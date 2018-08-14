import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { MainWhite } from '../ui/MainWhite'
import { Listing, Column } from '../ui/Listing'
import EmptyContent from '../ui/EmptyContent'
import Headline from '../ui/Headline'
import { EmptyLoader } from '../ui/Loader'
import * as actions from '../actions/channels'
import * as routes from '../utils/routes'
import { hasPermission } from '../utils'
import { Button } from 'react-md'

export class BotChannelIndexComponent extends Component {
  componentDidMount() {
    const { actions, permitted, fetching, bot } = this.props
    if (permitted && !fetching) {
      actions.fetchChannels({botId : bot.id})
    }
  }

  render() {
    const { channels, history, bot, fetching } = this.props

    if (!channels || fetching) {
      return <EmptyLoader>Loading channels for {bot.name}</EmptyLoader>
    } else {
      const channelList = Object.values(channels)
      const createChannel = () => {}

      const button = <Button
        floating
        secondary
        className='btn-mainTabs'
        onClick={createChannel}>
          add
      </Button>

      if (channelList.length == 0) {
        return <EmptyContent icon='settings_input_component'>
            <Headline>
              You have no channels yet
              <span><a href="javascript:" onClick={createChannel} className="hrefLink">Create One</a></span>
            </Headline>
          </EmptyContent>
      }

      const content = () => {
        if (channelList.length == 0) {
          return <EmptyContent icon='settings_input_component'>
              <Headline>
                You have no channels yet
                <span><a href="javascript:" onClick={createChannel} className="hrefLink">Create One</a></span>
              </Headline>
            </EmptyContent>
        } else {
          const title = channelList.length == 1 ? '1 channel' : `${channelList.length} channels`
          return <Listing items={channelList} title={title}
                  onItemClick={c => history.push(routes.botChannel(bot.id, c.id))}>
                <Column title="Name" render={c => c.name} />
                <Column title="Type" render={c => c.kind} />
                <Column title="Uses" render={c => null} />
                <Column title="Last activity date" render={c => null} />
              </Listing>
        }
      }

      return <MainWhite buttons={button}>
        {content()}
      </MainWhite>
    }
  }
}

const mapStateToProps = (state, { bot }) => ({
  permitted: hasPermission(bot, 'can_publish'),
  channels: state.channels.items,
  fetching: state.channels.fetching,
  errors: state.bots && state.bots.errors && state.bots.errors.filter((e) => e.path[0].startsWith("channel")) || []
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export const BotChannelIndex = withRouter(connect(mapStateToProps, mapDispatchToProps)(BotChannelIndexComponent))
