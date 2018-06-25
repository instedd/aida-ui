import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from '../actions/chat'
import * as api from '../utils/api'
import * as backend from '../utils/backend'
import * as notificationsActions from '../actions/notifications'
import socket from '../utils/socket'

class ChatClient extends Component {
  state = {
    channel: null,
    uuid: null
  }

  openChannel(uuid, accessToken) {
    const channel = socket.channel(`bot:${uuid}`, { access_token: accessToken })

    channel.join().receive('ok', response => {
      this.props.actions.chatConnected(uuid)
      channel.on('btu_msg', payload => {
        if (payload.session == this.props.sessionId) {
          this.props.actions.receiveMessage(payload.text)
        }
      })

    }).receive('error', err => {
      if (this.props.visible) {
        this.props.notificationsActions.pushNotification("Could not connect to bot preview")
      }
      this.closeChannel()
    })

    channel.onError(() => {
      this.closeChannel()
      this.openChannel(uuid, accessToken)
    })

    this.setState({ uuid, channel })
  }

  closeChannel() {
    const { channel } = this.state
    if (channel) {
      channel.leave()
    }
    this.props.actions.chatDisconnected(this.state.uuid)
    this.setState({ uuid: null, channel: null })
  }

  getNewSession() {
    const { channel } = this.state
    const { bot } = this.props

    if (channel && bot) {
      channel
        .push('new_session', {data: {first_name: 'John', last_name: 'Doe', gender: 'male'}})
        .receive('ok', resp => {
          api.setBotSession(bot, resp.session)
          .then((result) => {
            this.props.actions.newSession(bot, result.session_uuid)
          })
          .catch(() => this.props.notificationsActions.pushNotification("Unable to persist session"))
        })
        .receive('error', resp => {
          if (this.props.visible) {
            this.props.notificationsActions.pushNotification("Unable to start session")
          }
        })
    } else {
      console.error('Attempt to create a chat session with no connection')
    }
  }

  sendMessage(text) {
    const { actions, sessionId } = this.props
    const { channel } = this.state

    if (channel) {
      actions.sendMessage(text)
      channel.push('utb_msg', { session: sessionId, text: text })
    } else {
      console.error('Attempted to send a message with no connection')
    }
  }

  sendAttachment(file) {
    const { actions, sessionId, bot, previewUuid } = this.props
    const { channel } = this.state

    if (channel) {
      // TODO: trigger "uploadingAttachment" event to some hint in the UI
      // stating there's an upload in progress
      backend.uploadAttachment(previewUuid, sessionId, file)
        .then((result) => {
          const attachmentUuid = result.id
          channel.push('utb_img', { session: sessionId, image: attachmentUuid })
          actions.attachmentSent(attachmentUuid)
        }).catch((error) => {
          console.error('Error trying to upload an attachment', error)
        })
    } else {
      console.error('Attempted to upload an attachment with no connection')
    }
  }

  componentDidMount() {
    if (this.props.clientRef) {
      this.props.clientRef(this)
    }

    const { previewUuid, accessToken, publishing, sessionId } = this.props
    if (previewUuid && accessToken && !publishing) {
      // client is being re-created
      this.openChannel(previewUuid, accessToken)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.uuid != nextProps.previewUuid) {
      // bot changed, abandon current open channel
      this.closeChannel()
    }

    if (nextProps.publishing) {
      // still publishing, so do nothing
      return
    }

    if (nextProps.previewUuid != null
        && this.state.uuid != nextProps.previewUuid) {
      // a different bot was published for preview
      this.openChannel(nextProps.previewUuid, nextProps.accessToken)
    }
  }

  componentWillUnmount() {
    this.closeChannel()

    if (this.props.clientRef) {
      // we are going away
      this.props.clientRef(null)
    }
  }

  render() {
    return null
  }
}


const mapStateToProps = (state, { bot }) => {
  const { previewUuid, accessToken, publishing, sessionId, scope } = state.chat

  if (scope.botId == bot.id) {
    return {
      previewUuid,
      accessToken,
      publishing,
      sessionId
    }
  } else {
    return {
      previewUuid: null,
      accessToken: null,
      publishing: true,
      sessionId: null
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  notificationsActions: bindActionCreators(notificationsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(ChatClient)
