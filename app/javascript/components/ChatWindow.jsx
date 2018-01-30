import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Card,
         CardTitle,
         CardText,
         TextField,
         Button,
         FontIcon,
         Paper } from 'react-md'
import moment from 'moment'
import { Loader } from '../ui/Loader'

let ChatHeader = ({ title, publishing }) => (
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

const MessageBulk = ({ messages }) => {
  const sentMessages = messages[0].sent
  return (
    <Paper
      zDepth={2}
      className={"message-bubble " + (sentMessages ? "message-sent" : "message-received")} >
      {messages.map(message =>
        (<li key={message.id}>
          <div className="content-text">
            {message.text}
          </div>
          <div className="content-timestamp">
            {moment(message.timestamp).format("HH:mm")}
          </div>
        </li>)
      )}
    </Paper>
  )
}

class MessageList extends Component {

  scrollToBottom = () => {
    window.setTimeout(() =>
      this._messagesBottomDiv.scrollIntoView({behavior:"smooth"})
    , 0)
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  render() {
    const groupBy = (elems, func) => {
      const lastElem = (collection) => (collection[collection.length - 1])

      return elems.reduce(function(groups, elem) {
        const lastGroup = lastElem(groups)
        if (groups.length == 0 || func(lastElem(lastGroup)) != func(elem)) {
          groups.push([elem])
        } else {
          lastGroup.push(elem)
        }
        return groups
      }, [])
    }

    const { messages } = this.props
    const groupedMessages = groupBy(messages, (message) => (message.sent))

    return (
      <div className="chat-window-body">
        <ul>
          {groupedMessages.map((messages, ix) =>
            <MessageBulk
              key={`msg-bulk-${ix}`}
              messages={messages}
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

  focus() {
    setTimeout(() => {
      if (this._textfield) {
        this._textfield.focus()
      }
    }, 0)
  }

  render() {
    const { onSend, disabled, newSession } = this.props

    const sendMessageAndClearInput = () => {
      const text = this._textfield.value.trim()
      if (text != "") {
        onSend(text)
        this.setState({ messageText: "" })
      }
      this.focus()
    }

    const sendMessageIfEnterPressed = (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        sendMessageAndClearInput()
      }
    }

    return (
      <div className="chat-window-input">
        <div className="chat-input">
          <TextField
            id="chat-input"
            placeholder="Write your message here"
            value={this.state.messageText}
            onChange={messageText => this.setState({ messageText })}
            onKeyPress={sendMessageIfEnterPressed}
            ref={node => { this._textfield = node }}
            disabled={disabled} />
        </div>
        <div className="chat-button">
          <Button
            icon
            onClick={sendMessageAndClearInput}
            disabled={disabled}>
            send
          </Button>
          <Button
            icon
            onClick={() => { newSession(); this.focus() }}
            disabled={disabled}>
            replay
          </Button>
        </div>
      </div>
    )
  }
}

const ChatWindowComponent = ({ sendMessage, newSession, bot, messages, publishing, disabled, inputRef }) => (
  <Paper
    zDepth={5}
    className={"chat-window"}>
      <ChatHeader
        title={bot.name} publishing={publishing} />
      <MessageList
        messages={messages} />
      <InputMessage
        onSend={sendMessage} newSession={newSession} disabled={disabled} ref={inputRef}/>
  </Paper>
)

class ChatWindow extends Component {
  static propTypes = {
    bot: PropTypes.object.isRequired,
    messages: PropTypes.array.isRequired,
    publishing: PropTypes.bool,
    connected: PropTypes.bool,
    visible: PropTypes.bool,
    sessionId: PropTypes.string,
    onSendMessage: PropTypes.func.isRequired,
    onNewSession: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this._wantsFocus = props.visible
  }

  componentDidMount() {
    const { connected, publishing, sessionId, onNewSession } = this.props
    if (connected) {
      if (!sessionId) {
        onNewSession()
      } else if (!publishing && this._wantsFocus) {
        this.focus()
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { connected, sessionId, onNewSession } = nextProps
    if (!this.props.visible && nextProps.visible) {
      this._wantsFocus = true
    }
    if (connected) {
      if (!sessionId) {
        onNewSession()
      } else {
        if (!nextProps.publishing && this._wantsFocus && nextProps.visible) {
          this.focus()
        }
      }
    }
  }

  focus() {
    if (this._input) {
      this._input.focus()
      this._wantsFocus = false
    }
  }

  render() {
    const { bot, messages, connected, publishing, visible, sessionId, onSendMessage, onNewSession } = this.props

    if (visible) {
      return (
        <ChatWindowComponent bot={bot}
                             messages={messages}
                             sendMessage={onSendMessage}
                             newSession={onNewSession}
                             publishing={publishing}
                             inputRef={input => this._input = input}
                             disabled={!connected || publishing || sessionId == null} />
      )
    } else {
      return null
    }
  }
}

const mapStateToProps = (state) => ({
  messages: state.chat.messages,
  publishing: state.chat.publishing,
  sessionId: state.chat.sessionId,
  connected: state.chat.connected
})

const mapDispatchToProps = (dispatch) => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(ChatWindow)
