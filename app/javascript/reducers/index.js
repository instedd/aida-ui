import {combineReducers} from 'redux'
import auth from './auth'
import bots from './bots'
import channels from './channels'
import notifications from './notifications'

export default combineReducers({
  auth,
  bots,
  channels,
  notifications,
})
