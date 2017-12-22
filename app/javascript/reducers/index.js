import {combineReducers} from 'redux'
import auth from './auth'
import bots from './bots'
import channels from './channels'
import collaborators from './collaborators'
import frontDesk from './frontDesk'
import invitation from './invitation'
import notifications from './notifications'
import skills from './skills'
import stats from './stats'
import translations from './translations'
import xlsForms from './xlsForms'
import chat from './chat'

export default combineReducers({
  auth,
  bots,
  channels,
  chat,
  collaborators,
  frontDesk,
  invitation,
  notifications,
  skills,
  stats,
  translations,
  xlsForms,
})
