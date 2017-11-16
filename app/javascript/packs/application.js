/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { App, createAppStore } from '../app/application'

import { fetchBots } from '../actions/bots'
const store = createAppStore()

// console.log(store.getState())
// const unsubscribe = store.subscribe(() =>
//   console.log(store.getState())
// )

const render = () => {
  ReactDOM.render(<App store={store} />, document.getElementById('root'))
}

document.addEventListener('DOMContentLoaded', () => {
  render()
  console.log("Application loaded")
})

if (module.hot) {
  module.hot.accept('../app/application', () => {
    render()
    console.log("Application hot updated")
  });
}

