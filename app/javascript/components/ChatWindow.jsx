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

let ChatHeader = ({
  title
}) => (
  <div className="chat-window-header">
    <h2 className="bot-name">
      {title}
    </h2>
    <span className="help-text">
      Use this tool to test your bot skills
    </span>
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
    const { onSend } = this.props

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
            ref={node => { _textfield = node }} />
        </div>
        <div className="chat-button">
          <Button 
            icon
            onClick={() => sendMessageAndClearInput()}>
            send
          </Button>
        </div>
      </div>
    )
  }
}

const ChatWindow = ({
  actions,
  bot,
  messages,
  visible,
}) => (
    (!visible) ? null :
    <Paper
      zDepth={4}
      className={"chat-window"}>
        <ChatHeader 
          title={bot.name}/>
        <MessageList 
          messages={messages} />
        <InputMessage 
          onSend={(text) =>
            actions.sendMessage(text)
          } />
    </Paper>
)

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
