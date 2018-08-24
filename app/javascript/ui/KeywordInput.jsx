import React, { Component, PureComponent } from 'react'
import { DialogContainer, Button, TextField } from 'react-md'
import Field from './Field'

class DialogComponent extends Component {
  state = {
    authToken: ''
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      const authToken = nextProps.authToken || ''
      this.setState({authToken})
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
                   onChange={(authToken) => this.setState({authToken})} />
      </DialogContainer>
    )
  }
}


class KeywordInput extends PureComponent {
  constructor(props) {
    super(props)
    this.state = this.stateFor(props.value)
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.value != this.props.value) {
  //     this.setState(this.stateFor(nextProps.value))
  //   }
  // }

  stateFor(_) {
    return {
      dialogVisible: false
    }
  }

  render() {
    const { onChange, actions, bot, className, keywords, onKeywordChange, errors } = this.props
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

    return (
      <div>
        <Field
          id="kr-keywords"
          className={className}
          label="Valid keywords (comma separated)"
          value={keywords} onChange={onKeywordChange}
          error={errors.filter(e => e.path[1].startsWith("keywords/en"))}
        />
        <Button flat onClick={openDialog}>Enable WIT.ai</Button>
        <DialogComponent
          visible={dialogVisible}
          authToken={bot.wit_ai_auth_token}
          onClose={closeDialog}
          onSubmit={dialogSubmit}
        />
      </div>
    )
  }
}

export default KeywordInput
