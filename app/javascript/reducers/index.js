import {combineReducers} from 'redux'
import auth from './auth'
import bots from './bots'
import channels from './channels'

export default combineReducers({
  auth,
  bots,
  channels,
})
