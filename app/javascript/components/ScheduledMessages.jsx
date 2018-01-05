import React, { Component } from 'react'
import { TextField, SelectField, TableColumn, EditDialogColumn, SelectFieldColumn } from 'react-md'
import uuidv4 from 'uuid/v4'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import KeyValueListField from '../ui/KeyValueListField'

class ScheduledMessages extends Component {
  render() {
    const { skill, actions } = this.props
    const { name, config } = skill

    const updateConfig = (key) => {
      return (value) => {
        actions.updateSkill({
          ...skill,
          config: {
            ...skill.config,
            [key]: value
          }
        })
      }
    }

    const addMessage = () => {
      updateConfig('messages')([...skill.config.messages, {id: uuidv4(), delay: 60, message: ''}])
    }

    const removeMessage = (index) => {
      const newMessages = skill.config.messages.slice()
      newMessages.splice(index, 1)
      updateConfig('messages')(newMessages)
    }

    const updateMessage = (index, key) => (value) => {
      const newMessages = skill.config.messages.slice()
      newMessages[index][key] = value
      updateConfig('messages')(newMessages)
    }

    // duplicated in behaviour.rb
    const delayOptions = [
      {value: 60, label: '1 hour'},
      {value: 1440, label: '1 day'},
      {value: 10080, label: '1 week'},
      {value: 40320, label: '1 month'}, // 28 days month so we end up in the same day of week
    ]

    return (
      <div>
        <Title>Scheduled messages</Title>
        <Headline>
          Setup messages to be sent automatically on a schedule.
        </Headline>

        <SelectField
          id="schedule_type"
          className="ui-field"
          menuItems={[{label: "Schedule outgoing messages after last message received", value: "since_last_incoming_message"}]}
          defaultValue={config.schedule_type}
        />

        <KeyValueListField
          label="Messages"
          items={config.messages}
          createItemLabel="Add message" onCreateItem={addMessage}
          canRemoveItem={item => true} onRemoveItem={(item, index) => removeMessage(index)}
          renderKey={(item, index) => <SelectFieldColumn menuItems={delayOptions} value={item.delay} onChange={updateMessage(index, 'delay')} stripActiveItem={false} />}
          renderValue={(item, index) => <EditDialogColumn inline inlineIcon={null} value={item.message} onChange={updateMessage(index, 'message')}/>}
        />
      </div>
    )

  }
}

export default ScheduledMessages
