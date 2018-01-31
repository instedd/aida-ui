import * as api from '../utils/api'
import * as nacl from 'tweetnacl'
import pbkdf2 from 'pbkdf2'

export const FETCH = 'FETCH'
export const FETCH_SUCCESS = 'FETCH_SUCCESS'

export const fetch = () => ({
  type: FETCH
})

export const fetchSuccess = (encryptedKeyPair) => ({
  type: FETCH_SUCCESS,
  encryptedKeyPair
})

export const generateKeyPair = (passphrase) => (dispatch, getState) => {
  const keyPair = nacl.box.keyPair()

  const key = pbkdf2.pbkdf2Sync(passphrase, '', 1000, 32, "sha512")
  const nonce = new Uint8Array(24)

  // double check that the generated key is valid since pbkdf2
  // doesn't throws errors on missing algorithm
  if (key.every((k)=>(k == 0))) {
    throw "Missing hashing algorithm"
  }

  const encryptedSecretKey = nacl.secretbox(keyPair.secretKey, nonce, key)

  dispatch(fetch())

  return api.updateEncryptionKeys(encodeUint8Array(keyPair.publicKey), encodeUint8Array(encryptedSecretKey))
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
