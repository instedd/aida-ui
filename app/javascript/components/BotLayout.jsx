import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import EditableTitleLabel from '../ui/EditableTitleLabel'

import * as actions from '../actions/bot'
import AppLayout from './AppLayout'

const BotLayoutComponent = ({bot, children, actions}) =>
  <AppLayout
    title={
      <EditableTitleLabel
        title={bot.name}
        onSubmit={(name) => { actions.updateBot({...bot, name}) }} />
    }>
    {children}
  </AppLayout>

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
})

const BotLayout = connect(null, mapDispatchToProps)(BotLayoutComponent)

export default BotLayout
