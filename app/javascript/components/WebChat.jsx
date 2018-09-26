import React, { Component } from 'react'
import WebChatWindow from './WebChatWindow'
import WebChatClient from './WebChatClient'
import * as actions from '../actions/webChat'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

class WebChat extends Component {

  render() {
    const { botId, accessToken, actions } = this.props

    const sendChatMessage = (message) => {
      if (this._chatClient) {
        this._chatClient.sendMessage(message)
      }
    }

    const sendChatAttachment = (file) => {
      if (this._chatClient) {
        this._chatClient.sendAttachment(file)
      }
    }

    const newChatSession = () => {
      if (this._chatClient) {
        this._chatClient.getNewSession()
      }
    }

    actions.start(botId, accessToken)

    return <div>
      <WebChatClient botId={botId} accessToken={accessToken} clientRef={client => this._chatClient = client} />
      <WebChatWindow
        onSendMessage={sendChatMessage}
        onSendAttachment={sendChatAttachment}
        onNewSession={newChatSession}
      />
    </div>
  }
}

const mapDispatchToProps = dispatch => {
  return { actions: bindActionCreators(actions, dispatch) }
}

export default connect(null, mapDispatchToProps)(WebChat)
