import { normalize, schema } from 'normalizr'
import 'isomorphic-fetch'

export class Unauthorized {
  response : any

  constructor(response : any) {
    this.response = response
  }
}

const doFetch = (url, options) => {
  console.log(`${backendContentUrl}/${url}`)
  return fetch(`${backendContentUrl}/${url}`, { ...options, credentials: 'same-origin' })
    .then(response => {
      return handleResponse(response, () => response)
    })
}

const fetchJSONWithCallback = (url, schema, options, responseCallback) => {
  return doFetch(url, options)
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

export const fetchJSON = (url, schema, options) => {
  return fetchJSONWithCallback(url, schema, options, commonCallback)
}

const putOrPostJSON = (url, schema, verb, body) => {
  const options = {
    method: verb,
    headers: {
      'Accept': 'application/json',
    }
  }
  if (body) {
    if (body instanceof FormData) {
      options.body = body
    } else {
      options.body = JSON.stringify(body)
      options.headers['Content-Type'] = 'application/json'
    }
  }
  return fetchJSON(url, schema, options)
}

export const postJSON = (url, schema, body) => {
  return putOrPostJSON(url, schema, 'POST', body)
}

export const uploadAttachment = (bot_uuid : string, session_uuid : string, file : any) => {
  const formData = new FormData()
  formData.append('file', file)
  return postJSON(`image/${bot_uuid}/${session_uuid}`, null, formData)
}
