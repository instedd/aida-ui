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
         FileUpload,
         Paper } from 'react-md'
import moment from 'moment'
import { Loader } from '../ui/Loader'

let ChatHeader = ({ title, subtitle }) => (
  <div className="chat-window-header">
    <h2 className="bot-name">
      {title}
    </h2>
    <span className="help-text">
      @ {subtitle}
    </span>
  </div>
)

const messageContent = ({text}) => (
  <div className="content-text">
    {text}
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
          {messageContent(message)}
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
    const { onSend } = this.props

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
            ref={node => { this._textfield = node }} />
        </div>
        <div className="chat-button">
          <Button
            icon
            onClick={sendMessageAndClearInput}>
            send
          </Button>
        </div>
      </div>
    )
  }
}

const ChatWindowComponent = ({ sendMessage, bot, message, inputRef }) => (
  <Paper
    zDepth={5}
    className={"chat-window"}>
      <ChatHeader title={message.data.name || 'Unknown'} subtitle={bot.name} />
      <MessageList messages={[{id: message.id, text: message.data.message, sent: false, timestamp: message.created_at}]} />
      <InputMessage onSend={sendMessage} ref={inputRef}/>
  </Paper>
)

class ChatWindow extends Component {
  static propTypes = {
    message: PropTypes.object.isRequired,
    bot: PropTypes.object.isRequired,
    onSendMessage: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this._wantsFocus = props.message != null
  }

  componentDidMount() {
    if (this._wantsFocus) {
      this.focus()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.message && nextProps.message) {
      this._wantsFocus = true
      this.focus()
    }
  }

  focus() {
    if (this._input) {
      this._input.focus()
      this._wantsFocus = false
    }
  }

  render() {
    const { message, onSendMessage, bot } = this.props

    if (message != null) {
      return (
        <ChatWindowComponent message={message}
                             bot={bot}
                             sendMessage={onSendMessage}
                             inputRef={input => this._input = input}
                             />
      )
    } else {
      return null
    }
  }
}

export default ChatWindow
