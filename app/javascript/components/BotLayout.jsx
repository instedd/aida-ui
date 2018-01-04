import React, { Component, Children, cloneElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Route, Redirect } from 'react-router-dom'
import { DialogContainer, Button } from 'react-md'

import EditableTitleLabel from '../ui/EditableTitleLabel'
import { HeaderNavLink, HeaderNavAction } from '../ui/Header'
import { EmptyLoader } from '../ui/Loader'

import * as botActions from '../actions/bot'
import * as botsActions from '../actions/bots'
import * as r from '../utils/routes'
import AppLayout from './AppLayout'
import { BotChannel } from '../components/BotChannel'
import { BotBehaviour } from '../components/BotBehaviour'
import BotTranslations from '../components/BotTranslations'
import BotAnalytics from '../components/BotAnalytics'
import BotData from '../components/BotData'

import ChatWindow from './ChatWindow'
import * as chatActions from '../actions/chat'

export class BotLayoutComponent extends Component {
  state = {
    dialogVisible: false,
    chatWindowVisible: false
  }

  componentDidMount() {
    const { botsLoaded } = this.props
    if (!botsLoaded) {
      this.props.botsActions.fetchBots()
    }
  }

  render() {
    const { botsLoaded, bot, children, botActions, history, chatActions } = this.props
    const { dialogVisible, chatWindowVisible } = this.state

    const showDialog = () => this.setState({ dialogVisible: true })
    const hideDialog = () => this.setState({ dialogVisible: false })
    const deleteBot = () => {
      botActions.deleteBot(bot)
      history.replace(r.botIndex())
      hideDialog()
    }
    const toggleChatWindow = () => {
      this.setState({ chatWindowVisible: !this.state.chatWindowVisible })
      chatActions.startPreview(bot)
    }

    const dialogActions = [
      { secondary: true, children: 'Cancel', onClick: hideDialog },
      (<Button flat primary onClick={deleteBot}>Delete</Button>)
    ]
    const confirmationDialog = (
      <DialogContainer
        id="delete-bot-dialog"
        visible={dialogVisible}
        onHide={hideDialog}
        actions={dialogActions}
        title="Delete bot?">
        <h4>This will destroy the bot and all its associated data. Are you sure?</h4>
        <b>This action cannot be undone.</b>
      </DialogContainer>
    )

    const chatWindow =  (
      <ChatWindow visible={chatWindowVisible} />
    )

    if (botsLoaded == true && bot != null) {
      const defaultTab = (bot) => {
        if (bot.published) {
          return r.botAnalytics(bot.id)
        } else if (bot.channel_setup) {
          return r.botBehaviour(bot.id)
        } else {
          return r.botChannel(bot.id)
        }
      }

      return (
        <AppLayout
          title={
            <EditableTitleLabel
              title={bot.name}
            onSubmit={(name) => { botActions.updateBot({...bot, name}) }} />
          }
          headerNav={[
            <HeaderNavLink label="Analytics" to={r.botAnalytics(bot.id)} />,
            <HeaderNavLink label="Data" to={r.botData(bot.id)} />,
            // TODO: use active="/b/:id/channel"  to allow deep linking
            <HeaderNavLink label="Channel" to={r.botChannel(bot.id)} />,
            <HeaderNavLink label="Behaviour" to={r.botBehaviour(bot.id)} />,
            <HeaderNavLink label="Translations" to={r.botTranslations(bot.id)} />,
            // <HeaderNavLink label="Collaborators" to="#" />,
          ]}
          headerNavExtra={[
            // <HeaderNavAction label="Rename" />,
            <HeaderNavAction label="Unpublish" onClick={() => botActions.unpublishBot(bot)}/>,
            <HeaderNavAction label="Delete" onClick={showDialog} />,
          ]}
          buttonAction={() => botActions.publishBot(bot)} buttonIcon="publish"
        >
          <Route exact path="/b/:id" render={() => <Redirect to={defaultTab(bot)} />} />
          <Route exact path="/b/:id/data" render={() => <BotData bot={bot} />} />
          <Route exact path="/b/:id/analytics" render={() => <BotAnalytics bot={bot} />} />
          <Route exact path="/b/:id/channel" render={() => <BotChannel bot={bot} />} />
          <Route path="/b/:id/behaviour" render={() => <BotBehaviour bot={bot} onToggleChatWindow={toggleChatWindow}/>} />
          <Route exact path="/b/:id/translations" render={() => <BotTranslations bot={bot} />} />

          {/* Children.map(children, c => cloneElement(c, {bot})) */}

          {confirmationDialog}

          <Route path="/b/:id/behaviour" render={() => chatWindow} />
        </AppLayout>
      )
    } else if (botsLoaded == true && bot == null) {
      // TODO if items exists but no id, then 404
      return <AppLayout title="Bot not found" />
    } else {
      return <AppLayout><EmptyLoader>Loading bot</EmptyLoader></AppLayout>
    }
  }
}

const mapStateToProps = (state, {match}) => {
  let bot = null

  if (state.bots.items) {
    bot = state.bots.items[match.params.id] || null
  }

  return {
    botsLoaded: state.bots.items != null,
    bot: bot
  }
}

const mapDispatchToProps = (dispatch) => ({
  botActions: bindActionCreators(botActions, dispatch),
  botsActions: bindActionCreators(botsActions, dispatch),
  chatActions: bindActionCreators(chatActions, dispatch)
})

export const BotLayout = withRouter(connect(mapStateToProps, mapDispatchToProps)(BotLayoutComponent))
