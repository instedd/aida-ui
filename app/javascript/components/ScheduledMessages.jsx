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

    const everyValid = every > 0
    const atValid = (time => {
      if (time && time.match(/^[0-9]{1,2}:[0-9]{2}$/)) {
        const [ hour, minutes ] = time.split(':').map(x => parseInt(x))
        return hour >= 0 && hour <= 23 && minutes >= 0 && minutes <= 59
      } else {
        return false
      }
    })(at)
    const onValid = on && on.length == 1
    const eachValid = each && each >= 1 && each <= 31

    const allValid = (type => {
      switch (type) {
        case 'daily':
          return everyValid && atValid
        case 'weekly':
          return everyValid && onValid && atValid
        case 'monthly':
          return everyValid && eachValid && atValid
        default:
          return false
      }
    })(type)

    const dialogActions = [
      { primary: true, children: 'Cancel', onClick: onCancel },
      (<Button flat secondary disabled={!allValid} onClick={onConfirm}>Done</Button>)
    ]

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
                 error={!atValid}
                 onChange={value => onChange ? onChange({...recurrence, at: value.trim()}) : null}
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
    const { messages, onAdd, onChange, onRemove, errors } = this.props

    // keep in sync with behaviour.rb
    const delayUnits = [
      {value: 'minute', label: 'Minute', plural: 'Minutes'},
      {value: 'hour',   label: 'Hour',   plural: 'Hours'},
      {value: 'day',    label: 'Day',    plural: 'Days'},
      {value: 'week',   label: 'Week',   plural: 'Weeks'},
      {value: 'month',  label: 'Month',  plural: 'Months'}
    ]

    const addMessage = () => {
      onAdd({id: uuidv4(), delay: 1, delay_unit: 'hour', message: ''})
    }

    const canRemoveItem = () => true
    const removeMessage = (item, index) => {
      onRemove(index)
    }

    const renderDelay = (item, index) => {
      return (<span style={{whiteSpace: 'nowrap'}}>
        <TextField id={`schedule-delay-#{index}`}
                   value={item.delay}
                   type="number"
                   min={1}
                   fullWidth={false}
                   style={{width: "2em", marginRight: "0.5em"}}
                   onChange={value => onChange(index, 'delay', parseInt(value))} />
        <SelectField id={`schedule-delay-unit-#{index}`}
                     menuItems={delayUnits}
                     itemLabel={item.delay == 1 ? 'label' : 'plural'}
                     value={item.delay_unit}
                     onChange={value => onChange(index, 'delay_unit', value)}
                     style={{width: "5em"}}
                     stripActiveItem={false}
                     fullWidth={false} />
      </span>)
    }

    const renderMessage = (item, index) => {
      return (<Field id={`schedule-message-#{index}`}
      className="editable-field"
      value={item.message}
      onChange={value => onChange(index, 'message', value)}
      error={errors.filter(e => e.path[1].startsWith(`messages/${index}`))} />)
    }

    let messageError = ""

    if(errors.some(e => e.path[1] == "messages")) {
      messageError = (<label className="error-message">{errors.filter(e => e.path[1] == "messages")[0].message}</label>)
    }

    return (<div> <KeyValueListField label="Messages"
                               items={messages}
                               createItemLabel="Add message" onCreateItem={addMessage}
                               canRemoveItem={canRemoveItem} onRemoveItem={removeMessage}
                               renderKey={renderDelay}
                               renderValue={renderMessage} />
              <br/>{messageError}</div>
            )
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

    const canRemoveItem = () => true
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

    const changeStartDate = (_, value) => {
      value.setHours(0)
      value.setMinutes(0)
      value.setSeconds(0)
      onChangeStartDate(formatTimeISOWithTimezone(value))
    }

    return (<div>
      <DatePicker id="start-date"
                  label="Beginning"
                  value={date}
                  timeZone={getLocalTimezone()}
                  onChange={changeStartDate} />
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
    const { skill, actions, errors } = this.props
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
            messages: []
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
        const startDate = new Date()
        startDate.setHours(0)
        startDate.setMinutes(0)
        startDate.setSeconds(0)
        actions.updateSkill({
          ...skill,
          config: {
            schedule_type,
            start_date: formatTimeISOWithTimezone(startDate),
            messages: []
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
                                           onRemove={removeMessage}
                                           errors={errors} />)
             case 'fixed_time':
               return (<FixedTimeMessages messages={config.messages}
                                          onChange={updateMessage}
                                          errors={errors} />)
             case 'recurrent':
               return (<RecurrentMessages startDate={config.start_date}
                                          onChangeStartDate={updateConfig('start_date')}
                                          messages={config.messages}
                                          onAdd={addMessage}
                                          onChange={updateMessage}
                                          onRemove={removeMessage}
                                          errors={errors} />)
           }
        })()}

      </div>
    )
  }
}

export default ScheduledMessages
