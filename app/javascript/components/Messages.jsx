import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Paper } from 'react-md';
import AppLayout from './AppLayout'
import * as actions from '../actions/messages'
import * as botActions from '../actions/bots'
import { EmptyLoader } from '../ui/Loader'
import EmptyContent from '../ui/EmptyContent'
import Headline from '../ui/Headline'
import { MainWhite } from '../ui/MainWhite'
import HumanOverrideChatWindow from './HumanOverrideChatWindow'
import { FontIcon, List, Subheader, Switch, ListItem, ListItemControl, MenuButton, Button } from 'react-md'
import classNames from 'classnames/bind'
import moment from 'moment'

class MessagesBar extends Component {
  render() {
    const { messageList, bots, onClick, selected } = this.props

    const title = messageList.length == 1 ? '1 chat' : `${messageList.length} chats`

    return  <List className='sidebar messages-sidebar'>
      <Subheader primary primaryText={title} />
      {
        messageList.map((message, index) => (
          <ListItem
            key={index}
            active={index==selected}
            primaryText={[
              message.data.name || 'Unknown',
              ' ',
              <span className="botName">{`@${bots[message.bot_id].name}`}</span>
            ]}
            className={classNames({"selected": index==selected})}
            secondaryText={moment(message.created_at).fromNow()}
            onClick={() => onClick(message, index)}
          />
        ))
      }
    </List>
  }
}

class MessagesComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: null,
      selected: null
    }
    this.selectChat = this.selectChat.bind(this)
  }

  componentDidMount() {
    this.props.actions.fetchMessages()
    this.props.botActions.fetchBots()
  }

  selectChat(message, index) {
    this.setState({ message: message, selected: index })
  }

  render() {
    const { messages, bots } = this.props

    if (!messages || !bots) {
      return <AppLayout title='Messages'><EmptyLoader>Loading messages</EmptyLoader></AppLayout>
    } else {
      const messageList = Object.values(messages)

      let content
      if (messageList.length == 0) {
        content = (
           <EmptyContent icon='person'>
             <Headline>
               You have no messages yet
             </Headline>
           </EmptyContent>
        )
      } else {
        content = (
            <div className='main-with-sidebar'>
              <MessagesBar messageList={messageList} bots={bots} onClick={this.selectChat} selected={this.state.selected} />
              { this.state.message != null
                ? <HumanOverrideChatWindow
                    message={this.state.message}
                    bot={bots[this.state.message.bot_id]}
                    onSendMessage={(answer) => {
                      this.props.actions.answerMessage(this.state.message.id, answer)
                    }}
                    onResolveMessage={() => this.props.actions.resolveMessage(this.state.message.id)}
                  />
                : ''
              }
            </div>
        )
      }

      return <AppLayout title='Messages'>
        {content}
      </AppLayout>
    }
  }
}

const mapStateToProps = (state) => ({
  messages: state.messages.items,
  bots: state.bots.items,
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  botActions: bindActionCreators(botActions, dispatch),
})

export const Messages = connect(mapStateToProps, mapDispatchToProps)(MessagesComponent)
