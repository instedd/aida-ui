import prodStore from './configureStore.prod'
import createLogger from 'redux-logger'
import logger from 'redux-logger'

export default function configureStore(preloadedState) {
  console.log('logger')
  return prodStore(preloadedState, [logger])
}