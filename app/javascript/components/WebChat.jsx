import React, { Component } from 'react'
import WebChatWindow from './WebChatWindow'
import WebChatClient from './WebChatClient'

export class WebChat extends Component {

  render() {
    const { botId, accessToken } = this.props

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

    return  <div>
              <WebChatClient botId={botId} clientRef={client => this._chatClient = client} />
              <WebChatWindow
                onSendMessage={sendChatMessage}
                onSendAttachment={sendChatAttachment}
                onNewSession={newChatSession}
              />
    </div>
  }
}
