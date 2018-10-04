import { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from '../actions/webChat'
import * as backend from '../utils/backend'
import * as notificationsActions from '../actions/notifications'
import socket from '../utils/socket'
import PropTypes from 'prop-types'

class WebChatClient extends Component {
  static propTypes = {
    botId: PropTypes.string.isRequired,
    accessToken: PropTypes.string.isRequired
  }

  state = {
    channel: null,
    sessionId: null
  }

  getNewSession() {
    let { channel } = this.state
    const { actions } = this.props

    if (channel) {
      channel
        .push('new_session', {data: {first_name: 'Web', last_name: 'Chat', gender: 'male'}})
        .receive('ok', ({ session }) => {
          actions.newSession(session)
          this.setState({ sessionId: session })
        })
        .receive('error', resp => {
          if (this.props.visible) {
            this.props.notificationsActions.pushNotification("Unable to start session")
          }
        })
    }
  }

  openChannel() {
    const { botId, accessToken } = this.props
    const channel = socket.channel(`bot:${botId}`, { access_token: accessToken })

    channel.join().receive('ok', response => {
      this.props.actions.chatConnected(botId)
      channel.on('btu_msg', payload => {
        if (payload.session == this.state.sessionId) {
          this.props.actions.receiveMessage(payload.text)
        }
      })

    }).receive('error', err => {
      this.props.notificationsActions.pushNotification("Could not connect to bot")
      this.closeChannel()
    })

    channel.onError(() => {
      this.closeChannel()
      this.openChannel()
    })

    this.setState({ channel: channel })
  }

  closeChannel() {
    const { channel } = this.state
    const { botId } = this.props
    if (channel) {
      channel.leave()
    }
    this.props.actions.chatDisconnected(botId)
    this.setState({ channel: null })
  }

  sendMessage(text) {
    const { actions } = this.props
    const { channel, sessionId } = this.state

    if (channel) {
      actions.sendMessage(text)
      channel.push('utb_msg', { session: sessionId, text: text })
    } else {
      console.error('Attempted to send a message with no connection')
    }
  }

  sendAttachment(file) {
    const { actions, botId } = this.props
    const { channel, sessionId } = this.state

    if (channel) {
      // TODO: trigger "uploadingAttachment" event to some hint in the UI
      // stating there's an upload in progress
      backend.uploadAttachment(botId, sessionId, file)
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

    const { botId, accessToken } = this.props
    this.openChannel(botId, accessToken)
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

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  notificationsActions: bindActionCreators(notificationsActions, dispatch)
})

export default connect(null, mapDispatchToProps)(WebChatClient)
