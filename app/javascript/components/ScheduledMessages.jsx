import React, { Component } from 'react'
import { DatePicker, TimePicker, TextField, SelectField, TableColumn } from 'react-md'
import uuidv4 from 'uuid/v4'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import KeyValueListField from '../ui/KeyValueListField'
import { getLocalTimezone } from '../utils'

import RelevanceField from './RelevanceField'

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

    const changeScheduleType = (schedule_type) => {
      if (schedule_type == "since_last_incoming_message") {
        actions.updateSkill({
          ...skill,
          config: {
            ...skill.config,
            schedule_type,
            messages: []
          }
        })
      } else if (schedule_type == "fixed_time") {
        actions.updateSkill({
          ...skill,
          config: {
            ...skill.config,
            schedule_type,
            messages: [
              {id: uuidv4(), schedule: '', message: ''}
            ]
          }
        })
      } else {
        throw "Not implemented"
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

        <RelevanceField value={config.relevant} onChange={updateConfig('relevant')} />

        <SelectField
          id="schedule_type"
          className="ui-field"
          menuItems={[
            {label: "Schedule outgoing messages after last message received", value: "since_last_incoming_message"},
            {label: "Schedule an outgoing message at specific schedule", value: "fixed_time"},
          ]}
          value={config.schedule_type}
          onChange={value => changeScheduleType(value)}
        />

        {(() => {
          if (config.schedule_type != "since_last_incoming_message") return null;

          return (<KeyValueListField
            label="Messages"
            items={config.messages}
            createItemLabel="Add message" onCreateItem={addMessage}
            canRemoveItem={item => true} onRemoveItem={(item, index) => removeMessage(index)}
            renderKey={(item, index) => <SelectField id="schedule-delay" menuItems={delayOptions} value={item.delay} onChange={updateMessage(index, 'delay')} stripActiveItem={false} fullWidth={false} />}
            renderValue={(item, index) => <Field id="schedule-message" className="editable-field" value={item.message} onChange={updateMessage(index, 'message')}/>}
          />)
        })()}

        {(() => {
          if (config.schedule_type != "fixed_time") return null;

          const date = config.messages[0].schedule ? new Date(config.messages[0].schedule) : undefined

          return (<div>
            <div className="date-time-picker ui-field">
              <DatePicker id="schedule-date"
                          label="Schedule this message for"
                          inline
                          fullwidth={false}
                          value={date}
                          timeZone={getLocalTimezone()}
                          onChange={(_, value) => updateMessage(0, 'schedule')(value)} />
              <TimePicker id="schedule-time"
                          label="at"
                          inline
                          value={date}
                          onChange={(_, value) => updateMessage(0, 'schedule')(value)} />
            </div>

            <Field id="message" label="Message" value={config.messages[0].message} onChange={updateMessage(0, 'message')} />
          </div>)
        })()}
      </div>
    )

  }
}

export default ScheduledMessages
