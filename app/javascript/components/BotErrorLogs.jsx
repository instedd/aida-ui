import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import moment from 'moment'

import { MainGrey } from '../ui/MainGrey'
import Headline from '../ui/Headline'
import { EmptyLoader }  from '../ui/Loader'
import { Listing, Column } from '../ui/Listing'
import EmptyContent from '../ui/EmptyContent'

import * as actions from '../actions/errorLogs'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'

class ErrorLogList extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      timestamp: PropTypes.string,
      bot_id: PropTypes.string,
      session_id: PropTypes.string,
      skill_id: PropTypes.string,
      message: PropTypes.string
    })).isRequired,
  }

  lastActivityContent(item) {
    if (item.timestamp) {
      return moment(item.timestamp).format('LLLL')
    } else {
      return ''
    }
  }

  render() {
    const { items } = this.props

    const title = items.length == 1 ? '1 log' : `${items.length} logs`
    return (
      <Listing items={items} title={title}>
        <Column title="Session Id" render= {(item) => item.session_id }/>
        <Column title="Skill Id" render= {(item) => item.skill_id }/>
        <Column title="Message" render= {(item) => item.message }/>
        <Column title="Date" render= {this.lastActivityContent}/>
      </Listing>
    )
  }
}

class BotErrorLogs extends Component {
  componentDidMount() {
    const { permitted, bot, actions } = this.props
    if (permitted) {
      actions.fetchErrorLogs({ botId: bot.id })
    }
  }

  render() {
    const { permitted, bot, loaded, items, actions } = this.props

    if (!permitted) {
      return <ContentDenied />
    }

    if (!loaded) {
      return (<EmptyLoader>Loading logs for {bot.name}</EmptyLoader>)
    }

    if (items.length == 0) {
      return (
        <EmptyContent icon='done'>
          <Headline>
            This bot has no errors
          </Headline>
        </EmptyContent>
      )
    } else {
      return (
        <MainGrey>
          <ErrorLogList items={items} />
        </MainGrey>
      )
    }
  }
}

const mapStateToProps = (state, {bot}) => {
  const { fetching, scope, items } = state.errorLogs
  const permitted = hasPermission(bot, 'can_publish')
  if (!items || fetching || bot.id != scope.botId) {
    return {
      permitted,
      items: [],
      loaded: false
    }
  } else {
    return {
      permitted,
      items: items,
      loaded: true
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(BotErrorLogs)
