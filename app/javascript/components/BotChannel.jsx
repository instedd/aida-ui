import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { EmptyLoader }  from '../ui/Loader'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'
import * as channelActions from '../actions/channel'
import * as channelsActions from '../actions/channels'
import { BotChannelWebSocket } from '../components/BotChannelWebSocket'
import { withRouter } from 'react-router'
import { BotChannelFacebook } from './BotChannelFacebook';
import { MainWhite } from '../ui/MainWhite';
import { Button, DialogContainer } from 'react-md'
import * as routes from '../utils/routes'

class BotChannelComponent extends Component {
  state = {
    deleteDialogVisible: false
  }

  componentDidMount() {
    const { permitted, channel, bot } = this.props
    if (permitted && !channel) {
      this.props.channelsActions.fetchChannels({botId : bot.id})
    }
  }

  render() {
    const { permitted, channel, bot, channelActions, history } = this.props
    const { deleteDialogVisible } = this.state

    const styles = {
      multiline_tooltip: {
        "white-space": "pre"
      }
    }
    const showDeleteDialog = () => this.setState({ deleteDialogVisible: true })
    const hideDeleteDialog = () => this.setState({ deleteDialogVisible: false })

    const DeleteChannelDialog = ({ onHide, onConfirm, visible }) => {
      const dialogActions = [
        { primary: true, children: 'Cancel', onClick: onHide },
        (<Button flat secondary onClick={onConfirm}>Delete</Button>)
      ]
      return (
        <DialogContainer
          id="delete-channel-dialog"
          visible={visible}
          onHide={onHide}
          actions={dialogActions}
          title="Delete channel?">
          <h4>This will destroy the channel and all its associated data. Are you sure?</h4>
          <b>This action cannot be undone.</b>
        </DialogContainer>
      )
    }

    const deleteButton = () => {
      if (channel) {
        return <Button
          floating
          secondary
          className='btn-mainTabs'
          onClick={showDeleteDialog}>
            delete
        </Button>
      }
      else {
        return null
      }
    }

    const content = () => {
      if (!permitted) {
        return <ContentDenied />
      }

      if (channel) {
        const deleteChannel = () => {
          channelActions.deleteChannel(channel)
          history.push(routes.botChannelIndex(bot.id))
        }

        const deleteChannelDialog = <DeleteChannelDialog visible={deleteDialogVisible} onHide={hideDeleteDialog} onConfirm={deleteChannel} />

        switch (channel.kind) {
          case 'websocket':
            return  <div>
                      {deleteChannelDialog}
                      <BotChannelWebSocket channel={channel} errors={this.props.errors.filter((e) => e.path[0] == "channels/1")}
                        channelActions={channelActions} ></BotChannelWebSocket>
                    </div>
          case 'facebook':
            return  <div>
                      {deleteChannelDialog}
                      <BotChannelFacebook channel={channel} errors={this.props.errors.filter((e) => e.path[0] == "channels/0")}
                        channelActions={channelActions} bot={bot} ></BotChannelFacebook>
                    </div>
        }
      }
      return <EmptyLoader>Loading channel</EmptyLoader>
    }

    return <MainWhite buttons={deleteButton()}>{content()}</MainWhite>
  }
}

const mapStateToProps = ({channels, bots}, {bot, match}) => {
  const getChannel = () => {
    if (channels.scope && channels.scope.botId == bot.id && channels.items) {
      return Object.values(channels.items).find(c => c.id == match.params.c_id)
    }
  }

  return {
    permitted: hasPermission(bot, 'can_publish'),
    channel: getChannel(),
    errors: bots && bots.errors && bots.errors.filter((e) => e.path[0].startsWith("channel")) || []
  }
}

const mapDispatchToProps = (dispatch) => ({
  channelActions: bindActionCreators(channelActions, dispatch),
  channelsActions: bindActionCreators(channelsActions, dispatch),
})

export const BotChannel = withRouter(connect(mapStateToProps, mapDispatchToProps)(BotChannelComponent))
