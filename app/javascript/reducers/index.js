import {combineReducers} from 'redux'
import auth from './auth'
import bots from './bots'
import channels from './channels'
import chat from './chat'
import collaborators from './collaborators'
import errorLogs from './errorLogs'
import frontDesk from './frontDesk'
import invitation from './invitation'
import keypair from './keypair'
import messages from './messages'
import notifications from './notifications'
import skills from './skills'
import stats from './stats'
import tables from './tables'
import translations from './translations'
import xlsForms from './xlsForms'

export default combineReducers({
  auth,
  bots,
  channels,
  chat,
  collaborators,
  errorLogs,
  frontDesk,
  invitation,
  keypair,
  messages,
  notifications,
  skills,
  stats,
  tables,
  translations,
  xlsForms,
})
