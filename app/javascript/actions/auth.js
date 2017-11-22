// @flow
import * as T from '../utils/types'

export const INIT = 'AUTH_INIT'

export const authInit = (userEmail : string, userName : string) : T.AuthAction => ({
  type: INIT,
  userEmail: userEmail,
  userName: userName
})

