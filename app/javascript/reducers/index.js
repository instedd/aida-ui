import {combineReducers} from 'redux'
import auth from './auth'
import bots from './bots'
import channels from './channels'
import frontDesk from './frontDesk'
import notifications from './notifications'
import skills from './skills'
import stats from './stats'
import translations from './translations'
import xlsForms from './xlsForms'

export default combineReducers({
  auth,
  bots,
  channels,
  frontDesk,
  notifications,
  skills,
  stats,
  translations,
  xlsForms,
})
