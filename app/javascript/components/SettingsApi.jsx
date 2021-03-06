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
import { absoluteUrl } from '../utils/routes'

class SettingsApiComponent extends Component {
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
    const sessionsApi = "sessions/"
    const session_id_example = "2e2cf082-7c31-453c-aa9d-cbd1f949fee0"
    const sessionLogApi = `${sessionsApi}${session_id_example}/log`
    const sessionSendMessageApi = `${sessionsApi}${session_id_example}/send_message`

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
            label="Bot" menuItems={botOptions} disabled={botOptions.length == 0}
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
          <dl>
            <dt>Sessions data</dt>
            <dd>
              <code>
                $&nbsp;curl&nbsp;-H&nbsp;"{authHeader}"&nbsp;{botApi}{sessionsApi}
              </code>

              <code>
                $&nbsp;curl&nbsp;{botApi}{sessionsApi}?{authQuery}
              </code>
            </dd>
          </dl>
          <dl>
            <dt>Session log (example session id: {session_id_example})</dt>
            <dd>
              <code>
                $&nbsp;curl&nbsp;-H&nbsp;"{authHeader}"&nbsp;{botApi}{sessionLogApi}
              </code>

              <code>
                $&nbsp;curl&nbsp;{botApi}{sessionLogApi}?{authQuery}
              </code>
            </dd>
          </dl>
          <dl>
            <dt>Session send message (example session id: {session_id_example})</dt>
            <dd>
              <code>
                $&nbsp;curl&nbsp;-H&nbsp;"{authHeader}"&nbsp;-d&nbsp;"message=Test message"&nbsp;{botApi}{sessionSendMessageApi}
              </code>
              <code>
                $&nbsp;curl&nbsp;-d&nbsp;"message=Test message"&nbsp;{botApi}{sessionSendMessageApi}?{authQuery}
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
