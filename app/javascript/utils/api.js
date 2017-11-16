import { normalize, schema } from 'normalizr'
import 'isomorphic-fetch'

export class Unauthorized {
  constructor(response) {
    this.response = response
  }
}

const apiFetch = (url, options) => {
  return fetch(`/api/v1/${url}`, { ...options })
    .then(response => {
      return handleResponse(response, () => response)
    })
}

const apiFetchJSON = (url, schema, options) => {
  return apiFetchJSONWithCallback(url, schema, options, commonCallback)
}

const commonCallback = (json, schema) => {
  return () => {
    if (!json) { return null }
    if (json.errors) {
      console.log(json.errors)
    }
    if (schema) {
      return normalize(json, schema)
    } else {
      return json
    }
  }
}

const apiFetchJSONWithCallback = (url, schema, options, responseCallback) => {
  return apiFetch(url, options)
      .then(response => {
        if (response.status == 204) {
          // HTTP 204: No Content
          return { json: null, response }
        } else {
          return response.json().then(json => ({ json, response }))
        }
      })
      .then(({ json, response }) => {
        return handleResponse(response, responseCallback(json, schema))
      })
}

const handleResponse = (response, callback) => {
  if (response.ok) {
    return callback()
  } else if (response.status == 401 || response.status == 403) {
    return Promise.reject(new Unauthorized(response.statusText))
  } else {
    return Promise.reject(response)
  }
}

const botSchema = new schema.Entity('bots')

export const fetchBots = () => {
  return apiFetchJSON(`bots`, new schema.Array(botSchema))
}
