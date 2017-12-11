import { normalize, schema } from 'normalizr'
import 'isomorphic-fetch'

export class Unauthorized {
  response : any

  constructor(response : any) {
    this.response = response
  }
}

const apiFetch = (url, options) => {
  return fetch(`/api/v1/${url}`, { ...options, credentials: 'same-origin' })
    .then(response => {
      return handleResponse(response, () => response)
    })
}

export const apiFetchJSON = (url, schema, options) => {
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

const getCSRFToken = () => {
  for (var meta of document.getElementsByTagName("meta"))
    if (meta.name == "csrf-token")
      return meta.content
  throw "csrf-token meta not found"
}

const apiPutOrPostJSON = (url, schema, verb, body) => {
  const options = {
    method: verb,
    headers: {
      'Accept': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
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
  return apiFetchJSON(url, schema, options)
}

export const apiPostJSON = (url, schema, body) => {
  return apiPutOrPostJSON(url, schema, 'POST', body)
}

export const apiPutJSON = (url, schema, body) => {
  return apiPutOrPostJSON(url, schema, 'PUT', body)
}

export const apiDelete = (url) => {
  return apiFetch(url, {method: 'DELETE'})
}
