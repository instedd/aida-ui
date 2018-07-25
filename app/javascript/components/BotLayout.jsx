import React, { Component, Children, cloneElement } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Route, Redirect } from 'react-router-dom'
import { DialogContainer, Button, FontIcon } from 'react-md'

import EditableTitleLabel from '../ui/EditableTitleLabel'
import { HeaderNavLink, HeaderNavAction } from '../ui/Header'
import { EmptyLoader } from '../ui/Loader'

import * as botActions from '../actions/bot'
import * as botsActions from '../actions/bots'
import * as r from '../utils/routes'
import AppLayout from './AppLayout'
import BotErrorLogs from '../components/BotErrorLogs'
import { BotChannel } from '../components/BotChannel'
import { BotBehaviour } from '../components/BotBehaviour'
import BotTranslations from '../components/BotTranslations'
import BotTranslationsVariables from '../components/BotTranslationsVariables'
import BotTables from '../components/BotTables'
import BotAnalytics from '../components/BotAnalytics'
import BotData from '../components/BotData'
import BotCollaborators from '../components/BotCollaborators'
import { hasPermission } from '../utils'

import ChatClient from './ChatClient'
import ChatWindow from './ChatWindow'
import * as chatActions from '../actions/chat'

const DeleteBotDialog = ({ onHide, onConfirm, visible }) => {
  const dialogActions = [
    { primary: true, children: 'Cancel', onClick: onHide },
    (<Button flat secondary onClick={onConfirm}>Delete</Button>)
  ]
  return (
    <DialogContainer
      id="delete-bot-dialog"
      visible={visible}
      onHide={onHide}
      actions={dialogActions}
      title="Delete bot?">
      <h4>This will destroy the bot and all its associated data. Are you sure?</h4>
      <b>This action cannot be undone.</b>
    </DialogContainer>
  )
}

const LeaveBotDialog = ({ onHide, onConfirm, visible }) => {
  const dialogActions = [
    { primary: true, children: 'Cancel', onClick: onHide },
    (<Button flat secondary onClick={onConfirm}>Leave Bot</Button>)
  ]
  return (
    <DialogContainer
      id="leave-bot-dialog"
      visible={visible}
      onHide={onHide}
      actions={dialogActions}
      title="Leave bot?">
      <h4>You will leave the bot and stop collaborating. You will need a new invitation from the owner to access the bot again. Are you sure?</h4>
    </DialogContainer>
  )
}

export class BotLayoutComponent extends Component {
  state = {
    dialogVisible: false,
    chatWindowVisible: false,
    collaborators: false
  }

  componentDidMount() {
    const { botsLoaded } = this.props
    if (!botsLoaded) {
      this.props.botsActions.fetchBots()
    }
  }

  render() {
    const { botsLoaded, bot, children, botActions, history, chatActions, location } = this.props
    const { dialogVisible, chatWindowVisible } = this.state

    const showDialog = () => this.setState({ dialogVisible: true })
    const hideDialog = () => this.setState({ dialogVisible: false })
    const deleteBot = () => {
      botActions.deleteBot(bot)
      history.replace(r.botIndex())
      hideDialog()
    }
    const leaveBot = () => {
      botActions.leaveBot(bot)
      history.replace(r.botIndex())
      hideDialog()
    }
    const duplicateBot = () => {
      botActions.duplicateBot(bot, history)
    }
    const toggleChatWindow = () => {
      if (!this.state.chatWindowVisible) {
        this.setState({ chatWindowVisible: true })
        chatActions.startPreview(bot)
      } else {
        this.setState({ chatWindowVisible: false })
        chatActions.pausePreview(bot)
      }
    }

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
    if (botsLoaded == true && bot != null) {
      const canAdmin = hasPermission(bot, 'can_admin')
      const canPublish = hasPermission(bot, 'can_publish')
      const managesContent = hasPermission(bot, 'manages_content')
      const managesVariables = hasPermission(bot, 'manages_variables')
      const managesBehaviour = hasPermission(bot, 'manages_behaviour')
      const managesResults = hasPermission(bot, 'manages_results')

      const defaultTranslationsView = managesVariables && !managesContent
                                    ? r.botTranslationsVariables(bot.id)
                                    : r.botTranslationsContent(bot.id)

      const defaultTab = (() => {
        if (managesResults && bot.published) {
          return r.botAnalytics(bot.id)
        } else if (managesBehaviour && bot.channel_setup) {
          return r.botBehaviour(bot.id)
        } else if (canPublish) {
          return r.botChannel(bot.id)
        } else {
          return defaultTranslationsView
        }
      })()

      const showCollaborators = () => this.setState({ collaborators: true })
      const hideCollaborators = () => this.setState({ collaborators: false })

      const [buttonIcon, buttonAction] = (() => {
        if (location.pathname == r.botCollaborators(bot.id)) {
          if (canAdmin) {
            return ["email", showCollaborators]
          } else {
            return ["", null]
          }
        } else {
          return ["", null]
        }
      })()

      const isCollaborator = !!bot.collaborator_id
      const confirmationDialog = isCollaborator
                               ? (<LeaveBotDialog visible={dialogVisible} onHide={hideDialog} onConfirm={leaveBot} />)
                               : (<DeleteBotDialog visible={dialogVisible} onHide={hideDialog} onConfirm={deleteBot} />)

      const viewHasChat = location.pathname.startsWith(r.botAnalytics(bot.id)) ||
                          location.pathname.startsWith(r.botBehaviour(bot.id))
      const chatWindow = viewHasChat ? (
        <ChatWindow bot={bot}
                    visible={chatWindowVisible}
                    onSendMessage={sendChatMessage}
                    onSendAttachment={sendChatAttachment}
                    onNewSession={newChatSession} />

    ) : null

      return (
        <AppLayout
          title={canAdmin
               ? (<EditableTitleLabel title={bot.name} onSubmit={(name) => { botActions.updateBot({...bot, name}) }} />)
               : bot.name
          }
          headerNav={[
            <HeaderNavLink label="Analytics" to={r.botAnalytics(bot.id)} />,
            <HeaderNavLink label="Data" to={r.botData(bot.id)} />,
            // TODO: use active="/b/:id/channel"  to allow deep linking
            <HeaderNavLink label="Channel" to={r.botChannel(bot.id)} error={this.props.errors.some((e) => e.path[0].startsWith("channels"))} />,
            <HeaderNavLink label="Behaviour" to={r.botBehaviour(bot.id)} error={this.props.errors.some((e) => !e.path[0].startsWith("channels"))} />,
            <HeaderNavLink label="Translations" to={r.botTranslations(bot.id)} />,
            <HeaderNavLink label="Collaborators" to={r.botCollaborators(bot.id)} />,
            <HeaderNavLink label="Logs" to={r.botErrorLogs(bot.id)} />,
          ]}
          headerNavExtra={[
            <HeaderNavAction children={<FontIcon>get_app</FontIcon>} label="Download Manifest" disabled={!canPublish} onClick={() => window.location = `/api/v1/bots/${bot.id}/manifest.json`} />,
            <HeaderNavAction children={<FontIcon>content_copy</FontIcon>} label="Duplicate" disabled={!canAdmin} onClick={duplicateBot} />,
            <HeaderNavAction children={<FontIcon>remove_circle</FontIcon>} label="Unpublish" disabled={!canPublish} onClick={() => botActions.unpublishBot(bot)}/>,
            <HeaderNavAction children={<FontIcon>delete</FontIcon>} label={isCollaborator ? 'Leave' : 'Delete'} onClick={showDialog} />,
          ]}
          buttonAction={buttonAction} buttonIcon={buttonIcon}
        >
          <Route exact path="/b/:id" render={() => <Redirect to={defaultTab} />} />
          <Route exact path="/b/:id/data" render={() => <BotData bot={bot} />} />
          <Route exact path="/b/:id/analytics" render={() => <BotAnalytics bot={bot}  onToggleChatWindow={toggleChatWindow} />} />
          <Route exact path="/b/:id/channel" render={() => <BotChannel bot={bot} />} />
          <Route path="/b/:id/behaviour" render={() => <BotBehaviour bot={bot} onToggleChatWindow={toggleChatWindow}/>} />
          <Route exact path="/b/:id/translations" render={() => <Redirect to={defaultTranslationsView}/>} />
          <Route exact path="/b/:id/translations/content" render={() => <BotTranslations bot={bot} />} />
          <Route exact path="/b/:id/translations/variables" render={() => <BotTranslationsVariables bot={bot} />} />
          <Route path="/b/:id/translations/tables" render={() => <BotTables bot={bot} />} />
          <Route exact path="/b/:id/collaborators" render={() => <BotCollaborators bot={bot}
                                                                                   dialogVisible={this.state.collaborators}
                                                                                   showDialog={showCollaborators}
                                                                                   hideDialog={hideCollaborators} />} />
          <Route exact path="/b/:id/error_logs" render={() => <BotErrorLogs bot={bot}/>} />

          {confirmationDialog}

          <ChatClient bot={bot} visible={chatWindowVisible} clientRef={client => this._chatClient = client} />
          {chatWindow}
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
    bot: bot,
    errors: (state.bots.errors || [])
  }
}

const mapDispatchToProps = (dispatch) => ({
  botActions: bindActionCreators(botActions, dispatch),
  botsActions: bindActionCreators(botsActions, dispatch),
  chatActions: bindActionCreators(chatActions, dispatch)
})

export const BotLayout = withRouter(connect(mapStateToProps, mapDispatchToProps)(BotLayoutComponent))
