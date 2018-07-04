import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createDebounce from 'redux-debounced'
import createRavenMiddleware from "raven-for-redux"

import { BrowserRouter, Redirect, Route, Link } from 'react-router-dom'
import reducers from '../reducers'

import { BotIndex } from '../components/BotIndex'
import { BotLayout } from '../components/BotLayout'
import InvitationView from '../components/InvitationView'
import { SettingsApi } from '../components/SettingsApi'
import { SettingsEncryption} from '../components/SettingsEncryption'
import { Messages } from '../components/Messages'

let middleware = [
  createDebounce(),
  thunkMiddleware,
  createRavenMiddleware(window.Raven, {})
]

if (process.env.NODE_ENV !== 'production') {
  const { logger } = require('redux-logger')
  middleware = [...middleware, logger]
}

export const createAppStore = () => {
  return createStore(reducers, applyMiddleware(...middleware))
}

export const App = ({store}) => (
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <Route exact path="/" render={() => <Redirect to="/b"/>} />
        <Route exact path="/b" component={BotIndex} />
        <Route path="/b/:id" component={BotLayout} />
        <Route path="/invitation/:token" render={({match}) => <InvitationView token={match.params.token} />} />
        <Route exact path="/settings/api" component={SettingsApi} />
        <Route exact path="/settings/encryption" component={SettingsEncryption} />
        <Route exact path="/messages" component={Messages} />
      </div>
    </BrowserRouter>
  </Provider>
)
