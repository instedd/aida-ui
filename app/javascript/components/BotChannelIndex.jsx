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
import { Button, DialogContainer, List, ListItem, FontIcon } from 'react-md';
import sortBy from 'lodash/sortBy'

export class BotChannelIndexComponent extends Component {
  state = {
    createDialogVisible: false
  }

  componentDidMount() {
    const { actions, permitted, fetching, bot } = this.props
    if (permitted && !fetching) {
      actions.fetchChannels({botId : bot.id})
    }
  }

  render() {
    const { channels, history, bot, fetching, actions, errors } = this.props
    const { createDialogVisible } = this.state

    const showCreateDialog = () => this.setState({ createDialogVisible: true })
    const hideCreateDialog = () => this.setState({ createDialogVisible: false })

    const CreateChannelDialog = ({ onHide, visible }) => {
      const createChannel = kind => actions.createChannel({botId : bot.id}, kind, history)

      return (
        <DialogContainer
          id="create-channel-dialog"
          visible={visible}
          title="Choose a channel type"
          onHide={onHide}
        >
          <List>
            <ListItem primaryText="Facebook" onClick={() => createChannel('facebook')} />
            <ListItem primaryText="Web" onClick={() => createChannel('websocket')} />
          </List>
        </DialogContainer>
      )
    }

    const createChannelDialog = <CreateChannelDialog visible={createDialogVisible} onHide={hideCreateDialog} />

    if (!channels || fetching) {
      return <EmptyLoader>Loading channels for {bot.name}</EmptyLoader>
    } else {
      const channelList = Object.values(channels)

      const button = <Button
        floating
        secondary
        className='btn-mainTabs'
        onClick={showCreateDialog}>
          add
      </Button>

      if (channelList.length == 0) {
        return  <EmptyContent icon='settings_input_component'>
                  {createChannelDialog}
                  <Headline>
                    You have no channels yet
                    <span><a href="javascript:" onClick={showCreateDialog} className="hrefLink">Create One</a></span>
                  </Headline>
                </EmptyContent>
      }

      const errorIcon = (channelId) => {
        const errorIndex = sortBy(channelList, 'id').findIndex(channel => channel.id == channelId)
        const hasErrors = errors.some((e) => e.path[0] == `channels/${errorIndex}`)
        return hasErrors ? (<FontIcon className="error-in-bot-channel-index">lens</FontIcon>) : null
      }

      const channelType = kind => {
        if (kind == 'websocket') return 'Web'

        return kind.charAt(0).toUpperCase() + kind.slice(1)
      }

      const content = () => {
        const title = channelList.length == 1 ? '1 channel' : `${channelList.length} channels`
          return  <Listing items={channelList} title={title}
                    onItemClick={c => history.push(routes.botChannel(bot.id, c.id))}
                  >
                    <Column title="" render={c => errorIcon(c.id)} />
                    <Column title="Name" render={c => c.name} />
                    <Column title="Type" render={c => channelType(c.kind)} />
                    <Column title="Uses" render={c => null} />
                    <Column title="Last activity date" render={c => null} />
                  </Listing>
      }

      return <MainWhite buttons={button}>
        {createChannelDialog}
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
