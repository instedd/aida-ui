import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {  Card,
          CardTitle,
          CardText,
          TextField,
          Button,
          FontIcon,
          Paper } from 'react-md'
import * as actions from '../actions/chat'
import { Loader } from '../ui/Loader'
import socket from '../utils/socket'

let ChatHeader = ({title, publishing}) => (
  <div className="chat-window-header">
    <h2 className="bot-name">
      {title}
    </h2>
    <span className="help-text">
      Use this tool to test your bot skills
    </span>
    <div className="status">
      { publishing ? <Loader /> : null }
    </div>
  </div>
)

const Message = ({
  text,
  sent,
  timestamp
}) => (
  <li className={sent ? "message-sent" : "message-received"}>
    <Paper
      zDepth={2}
      className={"message-bubble " + (sent ? "message-sent" : "message-received")} >
      <div className="content-text">
        {text}
      </div>
      <div className="content-timestamp">
        {timestamp.getHours() + ":" + timestamp.getMinutes()}
      </div>
    </Paper>
  </li>
)

class MessageList extends Component {

  scrollToBottom = () => {
    this._messagesBottomDiv.scrollIntoView({behavior:"smooth"});
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  render() {
    const { messages } = this.props
    return (
      <div className="chat-window-body">
        <ul>
          {messages.map(message =>
            <Message
              key={message.id}
              {...message}
            />
          )}
        </ul>
        <div style={{ float: "left", clear: "both" }}
          ref={(el) => { this._messagesBottomDiv = el; }}>
        </div>
      </div>
    )
  }
}

class InputMessage extends Component {
  state = {
    messageText: ""
  }

  render() {
    const { onSend, disabled } = this.props

    const sendMessageAndClearInput = () => {
      const text = _textfield.value.trim()
      if (text != "") {
        onSend(text)
        this.setState({ messageText: "" })
      }
    }

    const sendMessageIfEnterPressed = (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        sendMessageAndClearInput()
      }
    }

    let _textfield;
    return (
      <div className="chat-window-input">
        <div className="chat-input">
          <TextField
            id="chat-input"
            label="Write your message here"
            value={this.state.messageText}
            onChange={(text) => this.setState({messageText: text})}
            onKeyPress={(ev) => (sendMessageIfEnterPressed(ev)) }
            ref={node => { _textfield = node }} disabled={disabled} />
        </div>
        <div className="chat-button">
          <Button
            icon
            onClick={() => sendMessageAndClearInput()}
            disabled={disabled}>
            send
          </Button>
        </div>
      </div>
    )
  }
}

const ChatWindowComponent = ({sendMessage, bot, messages, publishing, disabled}) => (
  <Paper
    zDepth={4}
    className={"chat-window"}>
      <ChatHeader
        title={bot.name} publishing={publishing}/>
      <MessageList
        messages={messages}  />
      <InputMessage
        onSend={(text) => sendMessage(text)} disabled={disabled} />
  </Paper>
)

class ChatWindow extends Component {
  state = {
    channel: null,
    previewUuid: null,
    sessionId: null
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.publishing == false && nextProps.previewUuid != null &&
        this.state.previewUuid != nextProps.previewUuid) {
      this.join(nextProps.previewUuid, nextProps.accessToken)
    }
  }

  join(previewUuid, accessToken) {
    let { channel } = this.state
    if (channel) { channel.leave() }
    this.setState({ previewUuid })

    channel = socket.channel(`bot:${previewUuid}`, {"access_token": accessToken})

    channel.join()
      .receive('ok', resp => {
        console.log('Joined successfully', resp)
        this.setState({ channel: channel, previewUuid: previewUuid, sessionId: null }, () => {
          this.getNewSession()
        })
      })
      .receive('error', resp => {
        // TODO handle error in UI
        console.log('Unable to join', resp)
        this.setState({ channel: null, previewUuid: null, sessionId: null })
      })

    channel.on('btu_msg', payload => {
      if (payload.session == this.state.sessionId) {
        this.props.actions.receiveMessage(payload.text)
      }
    })
  }

  getNewSession() {
    const { channel } = this.state

    channel
      .push('new_session', {})
      .receive('ok', resp => {
        console.log('New Session', resp)
        this.setState({ sessionId: resp.session })
      })
      .receive('error', resp => {
        // TODO handle error in UI
        console.log('Unable to start session', resp)
        this.setState({ sessionId: null })
      })
  }

  sendMessage(text) {
    const {actions} = this.props
    const {channel, sessionId} = this.state
    actions.sendMessage(text)
    channel.push('utb_msg', {session: sessionId, text: text})
  }

  render() {
    const {actions, bot, messages, publishing, visible} = this.props

    if (visible) {
      return (
        <ChatWindowComponent bot={bot} messages={messages}
        sendMessage={(text) => this.sendMessage(text)}
        publishing={publishing} disabled={publishing || this.state.sessionId == null} />
      )
    } else {
      return null
    }
  }
}

const mapStateToProps = (state) => {
  if (state.chat.scope) {
    state.chat.bot = state.bots.items[state.chat.scope.botId] || null
  }
  return state.chat
}
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})
export default connect(mapStateToProps, mapDispatchToProps)(ChatWindow)
