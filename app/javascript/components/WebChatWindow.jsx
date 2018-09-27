import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  TextField,
  Button,
  FontIcon,
  FileUpload,
  Paper
} from 'react-md'
import moment from 'moment'

const attachmentMessage = ({ attachment }) => (
  // TODO: this would probably not be a .content-text anymore
  <div className="content-text">
    <a href={`${backendContentUrl}/image/${attachment}`} target="_blank">
      <FontIcon>photo</FontIcon>
    </a>
  </div>
)

const textMessage = ({ text }) => (
  <div className="content-text">
    {text}
  </div>
)

const messageContent = (message) => {
  if (message.attachment) {
    return attachmentMessage(message)
  } else {
    return textMessage(message)
  }
}

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
      this._messagesBottomDiv.scrollIntoView({ behavior: "smooth" })
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

      return elems.reduce(function (groups, elem) {
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
    const { onSend, onSendAttachment, disabled } = this.props

    const sendMessageAndClearInput = () => {
      const text = this._textfield.value.trim()
      if (text != "") {
        onSend(text)
        this.setState({ messageText: "" })
      }
      this.focus()
    }

    const sendAttachment = (file) => {
      onSendAttachment(file)
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
          <FileUpload
            id="chat-attachment-upload"
            disabled={disabled}
            maxSize={25 * 1024 * 1024}
            flat
            label=""
            onLoad={sendAttachment}
            onSizeError={() => alert('File is too big. Maximum 25 MB allowed.')}>
            file_upload
          </FileUpload>
        </div>
      </div>
    )
  }
}

const ChatWindowComponent = ({ sendMessage, sendAttachment, messages, disabled, inputRef }) => (
  <div
    className={"chat-window mobile-chat"}>
    <MessageList
      messages={messages} />
    <InputMessage
      onSend={sendMessage} onSendAttachment={sendAttachment} disabled={disabled} ref={inputRef} />
  </div>
)

class WebChatWindow extends Component {
  static propTypes = {
    messages: PropTypes.array.isRequired,
    connected: PropTypes.bool,
    sessionId: PropTypes.string,
    onSendMessage: PropTypes.func.isRequired,
    onSendAttachment: PropTypes.func.isRequired,
    onNewSession: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this._wantsFocus = true
  }

  componentDidMount() {
    const { connected, sessionId, onNewSession } = this.props
    if (connected) {
      if (!sessionId) {
        onNewSession()
      } else if (this._wantsFocus) {
        this.focus()
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { connected, sessionId, onNewSession } = nextProps
    if (connected) {
      if (!sessionId) {
        onNewSession()
      } else if (this._wantsFocus) {
        this.focus()
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
    const { messages, connected, sessionId, onSendMessage, onSendAttachment, onNewSession } = this.props

    return <ChatWindowComponent messages={messages}
      sendMessage={onSendMessage}
      sendAttachment={onSendAttachment}
      newSession={onNewSession}
      inputRef={input => this._input = input}
      disabled={!connected || sessionId == null} />
  }
}

const mapStateToProps = (state) => ({
  messages: state.webChat.messages,
  sessionId: state.webChat.sessionId,
  connected: state.webChat.connected
})

export default connect(mapStateToProps)(WebChatWindow)
