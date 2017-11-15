// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import React from 'react'
import ReactDOM from 'react-dom'
import {Hello, foo} from './hello'

const render = () => {
  ReactDOM.render(<Hello name="React" />, document.getElementById('react-root'))
}

document.addEventListener('DOMContentLoaded', () => {
  render()
  console.log("loaded")
})

if (module.hot) {
  module.hot.accept('./hello', () => {
    render()
    console.log("updated")
  });
}
