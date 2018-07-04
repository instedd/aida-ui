import React, { Component } from 'react'
import { connect } from 'react-redux'

import AppLayout from './AppLayout'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'

class MessagesComponent extends Component {
  render() {
    return (
      <AppLayout title="Messages" />
    )
  }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = (dispatch) => ({})

export const Messages = connect(mapStateToProps, mapDispatchToProps)(MessagesComponent)
