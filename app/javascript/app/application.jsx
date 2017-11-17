import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'

import { BrowserRouter as Router, Redirect, Route, Link } from 'react-router-dom'
import reducers from '../reducers'
import { BotIndex } from '../components/BotIndex'
import { Bot } from '../components/Bot'

export const createAppStore = () => {
  return createStore(reducers, applyMiddleware(thunkMiddleware))
}

export const App = ({store}) =>
  <Provider store={store}>
    <Router>
      <div>
        <Route exact path="/" render={() => <Redirect to="/b"/>} />
        <Route exact path="/b" component={BotIndex} />
        <Route exact path="/b/:id" component={Bot} />
      </div>
    </Router>
  </Provider>
