import {combineReducers} from 'redux'
import auth from './auth'
import bots from './bots'

export default combineReducers({
  auth,
  bots,
})
