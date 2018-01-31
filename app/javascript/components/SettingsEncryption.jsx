import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { TextField, Button, FontIcon } from 'react-md'

import AppLayout from './AppLayout'
import { MainWhite } from '../ui/MainWhite'
import { SingleColumn } from '../ui/SingleColumn'
import Title from '../ui/Title'
import Headline from '../ui/Headline'

import * as actions from '../actions/keypair'

class SettingsEncryptionComponent extends Component {
  state = {
    passphrase: '',
    confirmation: '',
    warningDismissed: false
  }

  componentDidMount() {
    this.props.actions.fetchEncryptedKeyPair()
  }

  render() {
    const { actions, fetching, isKeyPairPresent } = this.props
    const { warningDismissed, passphrase, confirmation } = this.state

    const generateEncryptionKeys = () => {
      actions.generateKeyPair(this.state.passphrase)
        .then(()=>{
          this.setState({
            passphrase: '',
            confirmation: '',
            warningDismissed: false
          })
        })
    }

    const passwordsMatch = passphrase == confirmation

    const iconCheck = passwordsMatch
      ? (<FontIcon className="confirmation-check">done</FontIcon>)
      : (<FontIcon className="confirmation-warning">warning</FontIcon>)

    let main = null
    if (fetching) {
      main = <div> Loading </div>
    } else {
      const warning = (
        <div className="encryption-warning md-cell md-cell--bottom">
          <h3>Warning</h3>
          <div className="encryption-warning-content">
            A pair of public/private keys has already been generated. <br/>
            If a new pair is generated then existing encrypted data will be unrecoverable.
          </div>
          <div className="encryption-warning-action">
            <Button
              raised
              primary
              onClick={() => (this.setState({warningDismissed: true}))}>
              Continue
            </Button>
          </div>
        </div>
      )

      const passwordDialog = (
        <div>
          <TextField
            id="tf-passphrase"
            label="Passphrase"
            type="password"
            className="md-cell md-cell--bottom"
            value={passphrase}
            onChange={passphrase => this.setState({passphrase})}
          />
          <TextField
            id="tf-passphrase-confirm"
            label="Confirm passphrase"
            type="password"
            className="confirmation-input md-cell md-cell--bottom"
            value={this.state.confirmation}
            onChange={(confirmation) => this.setState({confirmation})}
          />
          {iconCheck}
          <div className="md-cell encryption-buttons">
            <Button
              secondary
              raised
              disabled={!passwordsMatch || passphrase.trim().length == 0}
              onClick={generateEncryptionKeys}>
              Generate keys
            </Button>
          </div>
        </div>
      )

      main = (
        <div>
          {(isKeyPairPresent && !warningDismissed) ? warning : null}
          {(!isKeyPairPresent || warningDismissed) ? passwordDialog : null}
        </div>
      )
    }

    return (
      <AppLayout title="Encryption">
        <MainWhite>
          <Title>Encryption Keys</Title>
          <Headline>
            Generate public and private encryption keys using a passphrase
          </Headline>
          {main}
        </MainWhite>
      </AppLayout>
    )
  }
}

const mapStateToProps = (state) => ({
  fetching: state.keypair.fetching,
  isKeyPairPresent: state.keypair.encryptedKeyPair &&
                    state.keypair.encryptedKeyPair.public_key &&
                    state.keypair.encryptedKeyPair.encrypted_secret_key
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
})

export const SettingsEncryption = connect(mapStateToProps, mapDispatchToProps)(SettingsEncryptionComponent)
