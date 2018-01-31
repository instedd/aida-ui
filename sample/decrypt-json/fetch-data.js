// Usage
// 1. Get auth token from API
// 2. Define passphrase in Encryption

// From terminal with docker installed:
// 1. Prepare dependencies
//   $ docker-compose run --rm app yarn install
// 2. Launch container to run script
//   $ docker-compose run app sh
// 3. Inside container run the script with auth_token, bot_id, passphrase
//   # yarn fetch-data --token <auth_token> --bot <bot_id> --passphrase <passphrase> [--host https://aida-stg.instedd.org]

var argv = require('minimist')(process.argv.slice(2))
argv.host = argv.host || 'https://aida-stg.instedd.org'

function apiGet(url) {
  var fetch = require('isomorphic-fetch')
  options = {
    headers: {
      "Authorization": `Bearer ${argv.token}`
    }
  }
  return fetch(`${argv.host}/api/v1/${url}`, { ...options })
    .then((response) => { return response.json() })
}

apiGet(`encryption_keys`).then(keys => {
  var nacl = require("tweetnacl")
  var pbkdf2 = require('pbkdf2')

  var public_key = new Buffer(keys.public_key, 'base64')
  var encrypted_secret_key = new Uint8Array(new Buffer(keys.encrypted_secret_key, 'base64'))
  const key = pbkdf2.pbkdf2Sync(argv.passphrase, '', 1000, 32, "sha512")
  const nonce = new Uint8Array(24)
  const secret_key = nacl.secretbox.open(encrypted_secret_key, nonce, key)

  if (secret_key == null) {
    console.log("Private key decrypt failed")
    return
  }

  function decrypt(value) {
    if (value.version == "1") {
      var msgpack = require("msgpack-lite")

      var encryption_box = msgpack.decode(new Buffer(value.data, 'base64'))
      var server_public_key = new Buffer(encryption_box[0])
      var nonce_base = encryption_box[1]

      var encrypted_recipient = encryption_box[2]
        .map((e, i) => ({public_key: e[0], encrypted_data: new Uint8Array(e[1]), index: i}))
        .find(e => e.public_key.equals(public_key))
      if (encrypted_recipient) {
        var nonce_suffix = encrypted_recipient.index.toString().padStart(4, "0").split('').map(c => c.charCodeAt(0))
        var nonce = new Uint8Array([...nonce_base, ...nonce_suffix])
        var unencrypted_data = nacl.box.open(encrypted_recipient.encrypted_data, nonce, server_public_key, secret_key)
        return JSON.parse(new Buffer(unencrypted_data).toString())
      } else {
        return "Encrypted pair not found"
      }
    } else {
      return "Unsupported encrypt version"
    }
  }

  apiGet(`bots/${argv.bot}/data.json`).then(json => {
    var decrypted = json.map((row) => {
      var data = row.data

      for (let [k, v] of Object.entries(row.data)) {
        if (v.type == "encrypted") {
          row.data[k] = decrypt(v)
        }
      }

      return row
    })

    console.log(JSON.stringify(decrypted,null,2))
  })
})
