import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createDebounce from 'redux-debounced'
import createRavenMiddleware from "raven-for-redux"
import reducers from '../reducers'

export default function createAppStore(preState, middlewares = [], enhancers = []) {
  return createStore(
    reducers,
    preState,
    compose(
      applyMiddleware(
        createDebounce(),
        thunkMiddleware,
        createRavenMiddleware(window.Raven, {}),
        ...middlewares
      ),
      ...enhancers
    )
  )
}