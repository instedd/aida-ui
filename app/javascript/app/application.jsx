import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Redirect, Route, Link } from 'react-router-dom'
import { BotIndex } from '../components/BotIndex'
import { BotLayout } from '../components/BotLayout'
import InvitationView from '../components/InvitationView'
import { SettingsApi } from '../components/SettingsApi'
import { SettingsEncryption} from '../components/SettingsEncryption'

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
      </div>
    </BrowserRouter>
  </Provider>
)
