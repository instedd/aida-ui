import React, { Component, PureComponent } from 'react'
import { DialogContainer, Button, FontIcon, TextField, SelectionControl } from 'react-md'
import Field from './Field'
import KeyValueListField from './KeyValueListField'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Aux from '../hoc/Aux'
class DialogComponent extends Component {
  state = {
    authToken: ''
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      const authToken = nextProps.authToken || ''
      this.setState({ authToken })
    }
  }

  render() {
    const { visible, onClose, onSubmit } = this.props

    const actions = [
      { primary: true, children: 'Cancel', onClick: onClose },
      (<Button flat secondary onClick={() => onSubmit(this.state.authToken)}>Done</Button>)
    ]

    return (
      <DialogContainer
        id="access-token-dialog"
        visible={visible}
        onHide={onClose}
        actions={actions}
        title="Use Wit.ai for intent detection">
        <h4>Enter the server access token from the settings section</h4>
        <TextField id="access-token-field"
          label="Access token"
          value={this.state.authToken}
          onChange={(authToken) => this.setState({ authToken })} />
      </DialogContainer>
    )
  }
}


class KeywordInput extends PureComponent {
  static propTypes = {
    onKeywordChange: PropTypes.func.isRequired,
    onUseWitAiChange: PropTypes.func.isRequired,
    onTrainingSentenceChange: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = this.stateFor(props.value)
  }

  stateFor(_) {
    return {
      dialogVisible: false
    }
  }

  render() {
    const { actions, bot, className, keywords, onKeywordChange, keywordErrors, trainingSentences, trainingSentenceErrors, onTrainingSentenceChange, onUseWitAiChange, useWitAi, witAiErrors } = this.props
    const { dialogVisible } = this.state

    const openDialog = () => {
      this.setState({ dialogVisible: true })
    }

    const closeDialog = () => {
      this.setState({ dialogVisible: false })
    }

    const dialogSubmit = (authToken) => {
      actions.checkWitAICredentials(bot, authToken)
      closeDialog()
    }

    const useWitAiChange = checked => {
      if (checked && !bot.wit_ai_auth_token) {
        openDialog()
      }
      onUseWitAiChange(checked)
    }

    const renderKeywords = () => <Field
      id="kr-keywords"
      className={className}
      label="Valid keywords (comma separated)"
      value={keywords} onChange={onKeywordChange}
      error={keywordErrors}
    />

    const renderWitAi = () => {
      const renderTrainingSentences = () => {

        const renderTrainingSentence = (item, ix) => {

          const updateTrainingSentence = (index, value) => {
            let _trainingSentences = [...trainingSentences]
            _trainingSentences[index] = value
            onTrainingSentenceChange(_trainingSentences)
          }

          return (<Field id={`schedule-message-#{index}`}
            className="editable-field"
            onChange={updateTrainingSentence}
            value={item}
            onChange={value => updateTrainingSentence(ix, value)}
            error={trainingSentenceErrors.filter(e => e.path[1] == `training_sentences/en/${ix}`)} />)
        }

        const addTrainingSentence = () => {
          const _trainingSentences = trainingSentences ? trainingSentences : []
          onTrainingSentenceChange([..._trainingSentences, ''])
        }

        const removeTrainingSentence = index => {
          let _trainingSentences = [...trainingSentences]
          _trainingSentences.splice(index, 1)
          onTrainingSentenceChange(_trainingSentences)
        }

        return <KeyValueListField
          className="trainingSentences"
          items={trainingSentences}
          createItemLabel="Add training sentence"
          onCreateItem={addTrainingSentence}
          renderKey={() => null}
          canRemoveItem={() => true}
          onRemoveItem={(item, index) => removeTrainingSentence(index)}
          renderValue={renderTrainingSentence}
        />
      }

      const renderError = () => {
        const error = trainingSentenceErrors.filter(e => e.path[1] == "training_sentences/en")[0]
        if (error) {
          return <label className="error-message">{error.message}</label>
        }
        else if (witAiErrors.some(error => error.message == 'multilingual-bot')) {
          return <label className="error-message">Wit.ai only works with english bots</label>
        }
      }

      const renderConnectionButton = () => {

        const connectionStatus = () => {
          if (witAiErrors.length && witAiErrors.some(error => error.message != 'multilingual-bot')) {
            return 'invalid'
          }
          else if (bot.wit_ai_auth_token) {
            return 'connected'
          }
        }

        const connButtonProps = () => {
          switch (connectionStatus()) {
            case 'connected':
              return {
                className: 'btn-status wit-ai-conn-ok',
                children: 'Connected',
                iconChildren: 'check'
              }
            case 'invalid':
              return {
                className: 'btn-status wit-ai-conn-error',
                children: 'Invalid credentials',
                iconChildren: 'close'
              }
            default:
              return {
                className: 'btn-status wit-ai-conn',
                children: 'Enable Wit.ai',
                iconChildren: ''
              }
          }
        }

        return <Button onClick={openDialog} {...connButtonProps()} />
      }

      return (
        <Aux>
          {renderConnectionButton()}
          {renderTrainingSentences()}
          {renderError()}
        </Aux>
      )
    }

    return <div className='ui-field'>
      {useWitAi ? null : renderKeywords()}
      <SelectionControl
        name="use-wit-ai"
        id="kr-wit-ai"
        label="Use Wit.ai for intent detection"
        type="checkbox"
        value="wit-ai"
        className="pull-left"
        checked={useWitAi}
        onChange={checked => useWitAiChange(checked)}
      />
      {useWitAi ? renderWitAi() : null}
      <DialogComponent
        visible={dialogVisible}
        authToken={bot.wit_ai_auth_token}
        onClose={closeDialog}
        onSubmit={dialogSubmit}
      />
    </div>
  }
}

const mapStateToProps = state => {
  return {
    witAiErrors: (state.bots && state.bots.errors) ? state.bots.errors.filter(e => e.path == 'wit_ai') : []
  }
}

export default connect(
  mapStateToProps
)(KeywordInput)
