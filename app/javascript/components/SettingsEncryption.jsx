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
    startConfirmation: false,
    isConfirmationCorrect: false
  }

  componentDidMount() {
    this.props.actions.fetchEncryptedKeyPair()
  }

  render() {
    const { actions, fetching, isKeyPairPresent} = this.props

    const generateEncryptionKeys = () => (actions.generateKeyPair(this.state.passphrase))

    const checkConfirmation = (passphrase, confirmation) => (passphrase == confirmation)

    let iconCheck = null
    if (this.state.isConfirmationCorrect) {
      iconCheck = <FontIcon className="confirmation-check">done</FontIcon>
    } else {
      iconCheck = <FontIcon className="confirmation-warning">warning</FontIcon>
    }

    let main = null
    if (fetching) {
      main = <div> Loading </div>
    } else {
      if (isKeyPairPresent) {
        main = (
          <div>
            Warning ...
          </div>
        )
      } else {
        main = (
          <div>
            <TextField
              id="tf-passphrase"
              label="Passphrase"
              type="password"
              className="md-cell md-cell--bottom"
              value={this.state.passphrase}
              onChange={(passphrase) => this.setState({
                passphrase,
                isConfirmationCorrect: checkConfirmation(passphrase, this.state.confirmation)
              })}
            />
            <TextField
              id="tf-passphrase-confirm"
              label="Confirm passphrase"
              type="password"
              className="confirmation-input md-cell md-cell--bottom"
              value={this.state.confirmation}
              onChange={(confirmation) => this.setState({
                confirmation,
                startConfirmation: true,
                isConfirmationCorrect: checkConfirmation(this.state.passphrase, confirmation)
              })}
            />
            { this.state.passphrase.trim() != "" && this.state.startConfirmation ? iconCheck : null }
            <div className="md-cell encryption-buttons">
              <Button
                secondary
                raised
                disabled={!this.state.isConfirmationCorrect}
                onClick={generateEncryptionKeys}>
                Generate keys
                    </Button>
            </div>
          </div>
        )
      }
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
  //isKeyPairPresent: !!state.keypair.encryptedKeyPair,
  isKeyPairPresent: state.keypair.encryptedKeyPair && state.keypair.encryptedKeyPair.public_key && state.keypair.encryptedKeyPair.encrypted_secret_key
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
})

export const SettingsEncryption = connect(mapStateToProps, mapDispatchToProps)(SettingsEncryptionComponent)
