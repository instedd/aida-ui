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

    const isConfirmationCorrect = (passphrase, confirmation) => (passphrase == confirmation)

    let iconCheck = null
    if (this.state.isConfirmationCorrect) {
      iconCheck = <FontIcon className="confirmation-check">done</FontIcon>
    } else {
      iconCheck = <FontIcon className="confirmation-warning">warning</FontIcon>
    }

    return (
      <AppLayout title="Encryption">
        <MainWhite>
          <Title>Encryption Keys</Title>
          <Headline>
            Generate public and private encryption keys using a passphrase
          </Headline>

          {fetching ? (
            <div> Loading </div>
          ) : (
            <div>
              <TextField
                id="tf-passphrase"
                label="Passphrase"
                type="password"
                className="md-cell md-cell--bottom"
                value={this.state.passphrase}
                onChange={(passphrase) => this.setState({
                    passphrase,
                    isConfirmationCorrect: isConfirmationCorrect(passphrase, this.state.confirmation) })}
              />
              <div className="passphrase-confirmation">
                <TextField
                  id="tf-passphrase-confirm"
                  label="Confirm passphrase"
                  type="password"
                  className="confirmation-input md-cell md-cell--bottom"
                  value={this.state.confirmation}
                  onChange={(confirmation) => this.setState({
                    confirmation,
                    startConfirmation: true,
                    isConfirmationCorrect: isConfirmationCorrect(this.state.passphrase, confirmation) })}
                />
                {this.state.passphrase.trim() != "" && this.state.startConfirmation ? iconCheck : null}
              </div>
              <div className="md-cell encryption-buttons">
                <Button
                  secondary
                  raised
                  onClick={generateEncryptionKeys}>
                    Generate keys
                </Button>
              </div>
            </div>
          )}
        </MainWhite>
      </AppLayout>
    )
  }
}

const mapStateToProps = (state) => ({
  fetching: state.keypair.fetching,
  isKeyPairPresent: !!state.keypair.encryptedKeyPair
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
})

export const SettingsEncryption = connect(mapStateToProps, mapDispatchToProps)(SettingsEncryptionComponent)
