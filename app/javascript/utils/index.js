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

export const generateToken = (length : number) => {
  const bytes = generateRandomBytes(length)
  const base64 = btoa(String.fromCharCode.apply(null, bytes))
  return base64.replace(/[\/\+lIO0=]/g, match => {
    switch (match) {
      case '/': return '-'
      case '+': return '_'
      case 'l': return 's'
      case 'I': return 'x'
      case 'O': return 'y'
      case '0': return 'z'
      case '=': return ''
      default:
        return match
    }
  })
}

const generateRandomBytes = (count) => {
  // modified copy of https://github.com/kelektiv/node-uuid/blob/master/lib/rng-browser.js
  var getRandomValues = typeof(window.crypto) != 'undefined' && window.crypto.getRandomValues.bind(window.crypto)

  if (getRandomValues) {
    // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
    return getRandomValues(new Uint8Array(count))

  } else {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    const bytes = new Array(count)
    for (var i = 0, r = 0; i < count; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return bytes;
  }
}

export const hasPermission = (bot : T.Bot, permission : T.Permission) => {
  return bot && bot.permissions[permission]
}
