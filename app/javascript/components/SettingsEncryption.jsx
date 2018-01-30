import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { TextField, Button } from 'react-md'

import AppLayout from './AppLayout'
import { MainWhite } from '../ui/MainWhite'
import { SingleColumn } from '../ui/SingleColumn'
import Title from '../ui/Title'
import Headline from '../ui/Headline'

import * as actions from '../actions/bots'
import * as api from '../utils/api'
import { absoluteUrl } from '../utils/routes'

class SettingsEncryptionComponent extends Component {
  state = {
    token: null,
    botId: null,
  }

  componentDidMount() {
    this.props.actions.fetchBots()
  }

  render() {
    const { bots } = this.props
    const { token, botId } = this.state

    const authHeader = `Authorization: Bearer ${token || "<ACCESS_TOKEN>"}`
    const authQuery = `access_token=${token || "<ACCESS_TOKEN>"}`
    const botApi = absoluteUrl(`/api/v1/bots/${botId || "<BOT_ID>"}/`)

    const botOptions = bots ? Object.values(bots).map(b => ({ label: b.name, value: b.id })) : []

    const generateToken = () => {
      api.generateToken()
        .then(response =>
          this.setState({ token: response.token })
        )
    }

    return (
      <AppLayout title="Encryption">
        <MainWhite>
          <Title>Encryption Keys</Title>
          <Headline>
            Generate public and private encryption keys using a passphrase
          </Headline>

          <TextField
            id="tf-passphrase"
            label="Passphrase"
            type="password"
            className="md-cell md-cell--bottom"
          />
          <div className="md-cell encryption-buttons">
            <Button flat secondary>Generate keys</Button>
          </div>

        </MainWhite>
      </AppLayout>
    )
  }
}

const mapStateToProps = (state) => ({
  bots: state.bots.items
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
})

export const SettingsEncryption = connect(mapStateToProps, mapDispatchToProps)(SettingsEncryptionComponent)
