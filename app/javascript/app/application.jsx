import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'

import { BrowserRouter, Redirect, Route, Link } from 'react-router-dom'
import reducers from '../reducers'

import { BotIndex } from '../components/BotIndex'
import { BotLayout } from '../components/BotLayout'

export const createAppStore = () => {
  return createStore(reducers, applyMiddleware(thunkMiddleware))
}

export const App = ({store}) =>
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <Route exact path="/" render={() => <Redirect to="/b"/>} />
        <Route exact path="/b" component={BotIndex} />
        <Route path="/b/:id" component={BotLayout} />
      </div>
    </BrowserRouter>
  </Provider>
