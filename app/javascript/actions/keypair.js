import * as api from '../utils/api'
import * as nacl from 'tweetnacl'

export const FETCH = 'FETCH'
export const FETCH_SUCCESS = 'FETCH_SUCCESS'
export const GENERATE_KEYPAIR = 'GENERATE_KEYPAIR'

export const fetch = () => ({
  type: FETCH
})

export const fetchSuccess = (encryptedKeyPair) => ({
  type: FETCH_SUCCESS,
  encryptedKeyPair
})

export const generateKeyPair = (passphrase) => (dispatch, getState) => {
  const keyPair = nacl.box.keyPair()
  const password = nacl.hash(new Uint8Array(passphrase.split().map(c => c.charCodeAt(0) & 255)))

  const nonce = password.slice(0, 24)
  const key = password.slice(24, 56)
  const encryptedSecretKey = nacl.secretbox(keyPair.secretKey, nonce, key)

  dispatch(fetch())

  api.updateEncryptionKeys(encodeUint8Array(keyPair.publicKey), encodeUint8Array(encryptedSecretKey))
    .then(response => dispatch(fetchSuccess(response)))
}

export const fetchEncryptedKeyPair = () => (dispatch, getState) => {
  dispatch(fetch())
  api.fetchEncryptionKeys()
    .then((response) => {
      dispatch(fetchSuccess(response))
    })
    .catch(() => console.log("Error fetching encrypted pair"))
}

const encodeUint8Array = (arr) => (btoa(String.fromCharCode.apply(null, arr)))
