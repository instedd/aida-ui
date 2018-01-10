import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Divider, Button, SelectField } from 'react-md'

import AppLayout from './AppLayout'
import { MainWhite } from '../ui/MainWhite'
import { SingleColumn } from '../ui/SingleColumn'
import Title from '../ui/Title'
import Headline from '../ui/Headline'

import * as actions from '../actions/bots'
import * as api from '../utils/api'

class SettingsApiComponent extends Component {
  state = {
    token: null,
    botId: null,
  }

  componentDidMount() {
    this.props.actions.fetchBots()
  }

  render() {
    const baseUrl = window.baseUrl

    const { bots } = this.props
    const { token, botId } = this.state

    const authHeader = `Authorization: Bearer ${token || "<ACCESS_TOKEN>"}`
    const authQuery = `access_token=${token || "<ACCESS_TOKEN>"}`
    const botApi = `${baseUrl}api/v1/bots/${botId || "<BOT_ID>"}/`

    const botOptions = bots ? Object.values(bots).map(b => ({label: b.name, value: b.id})) : []

    const generateToken = () => {
      api.generateToken()
        .then(response =>
          this.setState({token: response.token})
        )
    }

    return (
      <AppLayout title="API">
        <MainWhite>
          <Title>Access Token</Title>
          <Headline>
            Use the API to access all your bots
          </Headline>

          { token ? <code>{token}</code> : <Button raised onClick={generateToken}>Generate ACCESS_TOKEN</Button> }
          <br/>

          <SelectField id="select-bot" className="md-cell"
            label="Bot" menuItems={botOptions}
            value={botId || 0} onChange={botId => this.setState({botId}) } />
          <br/>

          <dl>
            <dt>JSON data</dt>
            <dd>
              <code>
              $&nbsp;curl&nbsp;-H&nbsp;"{authHeader}"&nbsp;{botApi}data.json
              </code>

              <code>
              $&nbsp;curl&nbsp;{botApi}data.json?{authQuery}
              </code>
            </dd>
          </dl>
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

export const SettingsApi = connect(mapStateToProps, mapDispatchToProps)(SettingsApiComponent)
