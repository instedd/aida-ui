import React, { Component, PureComponent } from 'react'
import { DialogContainer, Button, TextField, SelectionControl } from 'react-md'
import Field from './Field'
import KeyValueListField from './KeyValueListField'
import { connect } from 'react-redux'
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
    const { visible, skill, onClose, onSubmit } = this.props
    const isNewSkill = !skill || !skill.id
    const kind = skill && skill.kind

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
    const { actions, bot, className, keywords, onKeywordChange, keywordErrors, trainingSentences, trainingSentenceErrors, onTrainingSentenceCreate, onTrainingSentenceRemove, onTrainingSentenceChange, onUseWitAiChange, useWitAi, witAiError } = this.props
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
      if (checked) {
        openDialog()
      }
      if (onUseWitAiChange) {
        onUseWitAiChange(checked)
      }
    }

    const renderKeywords = () => {
      if (!useWitAi) {
        return <Field
          id="kr-keywords"
          className={className}
          label="Valid keywords (comma separated)"
          value={keywords} onChange={onKeywordChange}
          error={keywordErrors}
        />
      }
    }

    const renderTrainingSentence = (item, ix) => {
      return (<Field id={`schedule-message-#{index}`}
        className="editable-field"
        onChange={onTrainingSentenceChange}
        value={item}
        onChange={value => onTrainingSentenceChange(ix, value)}
        error={trainingSentenceErrors.filter(e => e.path[1] == `training_sentences/en/${ix}`)} />)
    }

    const renderTrainingSentences = () => {
      const renderError = () => {
        const error = trainingSentenceErrors.filter(e => e.path[1] == "training_sentences/en")[0]
        if (error) {
          return <label className="error-message">{error.message}</label>
        }
        else if (witAiError) {
          return <label className="error-message">Invalid credentials</label>
        }
      }

      if (useWitAi) {
        return <div>
          <KeyValueListField
            items={trainingSentences}
            createItemLabel="Add training sentence"
            onCreateItem={onTrainingSentenceCreate}
            renderKey={() => null}
            canRemoveItem={() => true}
            onRemoveItem={(item, index) => onTrainingSentenceRemove(index)}
            renderValue={renderTrainingSentence}
          />
          {renderError()}
        </div>
      }
    }

    return (
      <div>
        {renderKeywords()}
        <SelectionControl
          name="use-wit-ai"
          id="kr-wit-ai"
          label="Use Wit.ai for intent detection"
          type="checkbox"
          value="wit-ai"
          checked={useWitAi}
          onChange={checked => useWitAiChange(checked)}
        />
        <DialogComponent
          visible={dialogVisible}
          authToken={bot.wit_ai_auth_token}
          onClose={closeDialog}
          onSubmit={dialogSubmit}
        />
        {renderTrainingSentences()}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    witAiError: state.bots && state.bots.errors && state.bots.errors.some(e => e.path == "natural_language_interface")
  }
}

export default connect(
  mapStateToProps
)(KeywordInput)
