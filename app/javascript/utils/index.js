// @flow
import * as T from './types'
import moment from 'moment-timezone'

// convenience wrapper to debounce thunks, for use with redux-debounced
export const debounced = (key : string, time : number = 1000) => {
  return (thunk : T.ThunkAction) => {
    thunk.meta = {debounce: {time, key}}
    return thunk
  }
}

export const getLocalTimezone = () => {
  return moment.tz.guess()
}
