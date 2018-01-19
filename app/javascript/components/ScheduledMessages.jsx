import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  DatePicker,
  DialogContainer,
  EditDialogColumn,
  FontIcon,
  SelectField,
  SelectFieldColumn,
  SelectionControlGroup,
  TableColumn,
  TextField,
  TimePicker
} from 'react-md'
import uuidv4 from 'uuid/v4'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import KeyValueListField from '../ui/KeyValueListField'
import { getLocalTimezone } from '../utils'
import moment from 'moment'
import find from 'lodash/find'

import RelevanceField from './RelevanceField'

const daysOfTheWeek = [
  { label: 'Monday',    value: 'monday' },
  { label: 'Tuesday',   value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday',  value: 'thursday' },
  { label: 'Friday',    value: 'friday' },
  { label: 'Saturday',  value: 'saturday' },
  { label: 'Sunday',    value: 'sunday' },
]

const recurrenceDescription = (recurrence) => {
  const { type, every, on, each, at } = recurrence
  let description
  switch (type) {
    case 'daily':
      if (every == 1) {
        description = 'Daily'
      } else {
        description = `Every ${every} days`
      }
      break
    case 'weekly':
      if (every == 1) {
        description = 'Weekly'
      } else {
        description = `Every ${every} weeks`
      }
      const day = find(daysOfTheWeek, (day) => day.value == on[0])
      description += ` on ${day ? day.label : on[0]}`
      break
    case 'monthly':
      if (every == 1) {
        description = `Monthly`
      } else {
        description = `Every ${every} months`
      }
      description += ` on day ${each}`
      break
  }
  return description + ` at ${at}`
}

const formatTimeISOWithTimezone = (time) => {
  return moment(time).format('YYYY-MM-DDTHH:mm:ssZ')
}

class RecurrenceDialog extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    recurrence: PropTypes.object
  }

  render() {
    const { visible, onCancel, onConfirm, onChange, recurrence } = this.props
    const { type, every, at, on, each } = recurrence
    const dialogActions = [
      { primary: true, children: 'Cancel', onClick: onCancel },
      (<Button flat secondary onClick={onConfirm}>Done</Button>)
    ]

    const changeRecurrenceType = (value) => {
      if (!onChange) return

      switch (value) {
        case 'daily':
          onChange({ type: 'daily', every, at })
          break
        case 'weekly':
          onChange({ type: 'weekly', every, at, on: ['monday'] })
          break
        case 'monthly':
          onChange({ type: 'monthly', every, at, each: 1 })
          break
      }
    }

    const everyField = (
      <TextField id="recurrence-every"
                 type="number"
                 min={1} max={500}
                 fullWidth={false}
                 style={{width: "2em"}}
                 onChange={value => onChange ? onChange({...recurrence, every: parseInt(value)}) : null}
                 value={every} />
    )

    const eachField = (
      <TextField id="recurrence-each"
                 type="number"
                 min={1} max={31}
                 fullWidth={false}
                 style={{width: "2em"}}
                 onChange={value => onChange ? onChange({...recurrence, each: parseInt(value)}) : null}
                 value={each} />
    )

    const onField = (
      <SelectField id="recurrence-on"
                   fullWidth={false}
                   menuItems={daysOfTheWeek}
                   onChange={value => onChange ? onChange({...recurrence, on: [value]}) : null}
                   value={on ? on[0] : null} />
    )

    const atField = (
      <TextField id="recurrence-at"
                 fullWidth={false}
                 style={{width: "3em"}}
                 onChange={value => onChange ? onChange({...recurrence, at: value}) : null}
                 value={at} />
    )

    return (
      <DialogContainer
        id="recurrence-dialog"
        visible={visible}
        onHide={onCancel}
        actions={dialogActions}
        width={600}
        title="Recurrence">
        <h4>Select an option to schedule recurrence</h4>
        <SelectionControlGroup id="recurrence-type"
                               name="recurrence-type"
                               type="radio"
                               value={type}
                               onChange={changeRecurrenceType}
                               controls={[
                                 {
                                   value: 'daily',
                                   label: type == 'daily'
                                        ? (<div className="recurrence-data">
                                            Daily every &nbsp; {everyField} &nbsp; days at &nbsp; {atField}
                                          </div>)
                                        : 'Daily'
                                 },
                                 {
                                   value: 'weekly',
                                   label: type == 'weekly'
                                        ? (<div className="recurrence-data">
                                            Weekly every &nbsp; {everyField} &nbsp; week on &nbsp; {onField} &nbsp; at &nbsp; {atField}
                                          </div>) : 'Weekly'
                                 },
                                 {
                                   value: 'monthly',
                                   label: type == 'monthly'
                                        ? (<div className="recurrence-data">
                                            Monthly every &nbsp; {everyField} &nbsp; month on day &nbsp; {eachField} &nbsp; at &nbsp; {atField}
                                          </div>) : 'Monthly'
                                 }
                               ]} />
      </DialogContainer>
    )
  }
}

class InactivityMessages extends Component {
  static propTypes = {
    messages: PropTypes.array.isRequired,
    onAdd: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
  }

  render() {
    const { messages, onAdd, onChange, onRemove } = this.props

    // duplicated in behaviour.rb
    const delayOptions = [
      {value: 60, label: '1 hour'},
      {value: 1440, label: '1 day'},
      {value: 10080, label: '1 week'},
      {value: 40320, label: '1 month'}, // 28 days month so we end up in the same day of week
    ]

    const addMessage = () => {
      onAdd({id: uuidv4(), delay: 60, message: ''})
    }

    const canRemoveItem = () => messages.length > 1
    const removeMessage = (item, index) => {
      onRemove(index)
    }

    const renderDelay = (item, index) => {
      return (<SelectField id={`schedule-delay-#{index}`}
                           menuItems={delayOptions}
                           value={item.delay}
                           onChange={value => onChange(index, 'delay', value)}
                           stripActiveItem={false}
                           fullWidth={false} />)
    }
    const renderMessage = (item, index) => {
      return (<Field id={`schedule-message-#{index}`}
                     className="editable-field"
                     value={item.message}
                     onChange={value => onChange(index, 'message', value)} />)
    }

    return (<KeyValueListField label="Messages"
                               items={messages}
                               createItemLabel="Add message" onCreateItem={addMessage}
                               canRemoveItem={canRemoveItem} onRemoveItem={removeMessage}
                               renderKey={renderDelay}
                               renderValue={renderMessage} />)
  }
}

class FixedTimeMessages extends Component {
  static propTypes = {
    messages: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
  }

  render() {
    const { messages, onChange } = this.props
    const date = messages[0].schedule ? new Date(messages[0].schedule) : undefined

    return (<div>
      <div className="date-time-picker ui-field">
        <DatePicker id="schedule-date"
                    label="Schedule this message for"
                    inline
                    fullwidth={false}
                    value={date}
                    timeZone={getLocalTimezone()}
                    onChange={(_, value) => onChange(0, 'schedule', value)} />
        <TimePicker id="schedule-time"
                    label="at"
                    inline
                    value={date}
                    onChange={(_, value) => onChange(0, 'schedule', value)} />
      </div>

      <Field id="message" label="Message"
             value={messages[0].message}
             onChange={value => onChange(0, 'message', value)} />
    </div>)
  }
}

class RecurrentMessages extends Component {
  static propTypes = {
    startDate: PropTypes.string.isRequired,
    onChangeStartDate: PropTypes.func.isRequired,
    messages: PropTypes.array.isRequired,
    onAdd: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
  }

  state = {
    dialogVisible: false,
    index: null,
    recurrence: {}
  }

  render() {
    const { startDate, onChangeStartDate, messages, onAdd, onChange, onRemove } = this.props

    const date = startDate ? new Date(startDate) : undefined

    const addMessage = () => {
      onAdd({id: uuidv4(), recurrence: {type: 'daily', every: 1, at: '00:00'}, message: ''})
    }

    const canRemoveItem = () => messages.length > 1
    const removeMessage = (item, index) => {
      onRemove(index)
    }

    const editRecurrence = (index) => {
      const recurrence = messages[index].recurrence
      this.setState({ dialogVisible: true, index, recurrence: {...recurrence} })
    }
    const hideDialog = () => {
      this.setState({ dialogVisible: false })
    }
    const saveRecurrence = () => {
      const { index, recurrence } = this.state
      onChange(index, 'recurrence', recurrence)
      hideDialog()
    }

    const renderRecurrence = (item, index) => {
      const description = recurrenceDescription(item.recurrence)
      return (<span className="recurrence-column"
                    onClick={() => editRecurrence(index)}>
        {description}
      </span>)
    }
    const renderMessage = (item, index) => {
      return (<Field id={`recurrent-message-#{index}`}
                     className="editable-field"
                     value={item.message}
                     onChange={value => onChange(index, 'message', value)} />)
    }

    return (<div>
      <DatePicker id="start-date"
                  label="Beginning"
                  value={date}
                  timeZone={getLocalTimezone()}
                  onChange={(_, value) => onChangeStartDate(formatTimeISOWithTimezone(value))} />
      <KeyValueListField label="Messages"
                         items={messages}
                         createItemLabel="Add message" onCreateItem={addMessage}
                         canRemoveItem={canRemoveItem} onRemoveItem={removeMessage}
                         renderKey={renderRecurrence}
                         renderValue={renderMessage} />
      <RecurrenceDialog visible={this.state.dialogVisible}
                        onCancel={hideDialog}
                        onConfirm={saveRecurrence}
                        onChange={recurrence => this.setState({ recurrence })}
                        recurrence={this.state.recurrence} />
    </div>)
  }
}

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
            schedule_type,
            messages: [
              {id: uuidv4(), delay: 60, message: ''}
            ]
          }
        })
      } else if (schedule_type == "fixed_time") {
        actions.updateSkill({
          ...skill,
          config: {
            schedule_type,
            messages: [
              {id: uuidv4(), schedule: '', message: ''}
            ]
          }
        })
      } else if (schedule_type == "recurrent") {
        actions.updateSkill({
          ...skill,
          config: {
            schedule_type,
            start_date: formatTimeISOWithTimezone(new Date()),
            messages: [
              {id: uuidv4(), recurrence: {type: 'daily', every: 1, at: '00:00'}, message: ''}
            ]
          }
        })
      } else {
        throw "Not implemented"
      }
    }

    const addMessage = (message) => {
      updateConfig('messages')([...skill.config.messages, message])
    }

    const removeMessage = (index) => {
      const newMessages = skill.config.messages.slice()
      newMessages.splice(index, 1)
      updateConfig('messages')(newMessages)
    }

    const updateMessage = (index, key, value) => {
      const newMessages = skill.config.messages.slice()
      newMessages[index][key] = value
      updateConfig('messages')(newMessages)
    }

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
            {label: "Schedule recurrent outgoing messages", value: "recurrent"},
          ]}
          value={config.schedule_type}
          onChange={value => changeScheduleType(value)}
        />

        {(() => {
           switch (config.schedule_type) {
             case 'since_last_incoming_message':
               return (<InactivityMessages messages={config.messages}
                                           onAdd={addMessage}
                                           onChange={updateMessage}
                                           onRemove={removeMessage} />)
             case 'fixed_time':
               return (<FixedTimeMessages messages={config.messages}
                                          onChange={updateMessage} />)
             case 'recurrent':
               return (<RecurrentMessages startDate={config.start_date}
                                          onChangeStartDate={updateConfig('start_date')}
                                          messages={config.messages}
                                          onAdd={addMessage}
                                          onChange={updateMessage}
                                          onRemove={removeMessage} />)
           }
        })()}

      </div>
    )
  }
}

export default ScheduledMessages
