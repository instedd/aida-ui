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

export const createAppStore = () => {
  return createStore(reducers, applyMiddleware(
    createDebounce(),
    thunkMiddleware,
    createRavenMiddleware(window.Raven, {})
  ))
}

export const App = ({store}) => (
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <Route exact path="/" render={() => <Redirect to="/b"/>} />
        <Route exact path="/b" component={BotIndex} />
        <Route path="/b/:id" component={BotLayout} />
        <Route path="/invitation/:token" render={({match}) => <InvitationView token={match.params.token} />} />
      </div>
    </BrowserRouter>
  </Provider>
)
