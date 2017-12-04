import {combineReducers} from 'redux'
import auth from './auth'
import bots from './bots'
import channels from './channels'
import frontDesk from './frontDesk'
import notifications from './notifications'
import skills from './skills'
import translations from './translations'

export default combineReducers({
  auth,
  bots,
  channels,
  frontDesk,
  notifications,
  skills,
  translations,
})
