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

class ScheduledMessages extends Component {
  state = {
    dialogVisible: false,
    index: null,
    recurrence: {}
  }

  render() {
    const { skill, actions } = this.props
    const { name, config } = skill
    const { dialogVisible, recurrence } = this.state

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
        this.setState({ dialogVisible: false })
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

    const addDelayedMessage = () => {
      updateConfig('messages')([...skill.config.messages, {id: uuidv4(), delay: 60, message: ''}])
    }
    const addRecurrentMessage = () => {
      updateConfig('messages')([...skill.config.messages, {id: uuidv4(), recurrence: {type: 'daily', every: 1, at: '00:00'}, message: ''}])
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
            {label: "Schedule recurrent outgoing messages", value: "recurrent"},
          ]}
          value={config.schedule_type}
          onChange={value => changeScheduleType(value)}
        />

        {(() => {
           if (config.schedule_type != "since_last_incoming_message") return null;

           const canRemoveItem = config.messages.length > 1

           return (<KeyValueListField
                     label="Messages"
                     items={config.messages}
                     createItemLabel="Add message" onCreateItem={addDelayedMessage}
                     canRemoveItem={() => canRemoveItem} onRemoveItem={(item, index) => removeMessage(index)}
                     renderKey={(item, index) => <SelectField id={`schedule-delay-#{index}`} menuItems={delayOptions} value={item.delay} onChange={updateMessage(index, 'delay')} stripActiveItem={false} fullWidth={false} />}
                     renderValue={(item, index) => <Field id={`schedule-message-#{index}`} className="editable-field" value={item.message} onChange={updateMessage(index, 'message')}/>}
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

        {(() => {
           if (config.schedule_type != "recurrent") return null;

           const date = config.start_date ? new Date(config.start_date) : undefined
           const canRemoveItem = config.messages.length > 1

           const editRecurrence = (index) => {
             const recurrence = config.messages[index].recurrence
             this.setState({ dialogVisible: true, index, recurrence: {...recurrence} })
           }
           const hideDialog = () => {
             this.setState({ dialogVisible: false })
           }
           const saveRecurrence = () => {
             const { index, recurrence } = this.state
             updateMessage(index, 'recurrence')(recurrence)
             hideDialog()
           }

           return (<div>
             <DatePicker id="start-date"
                         label="Beginning"
                         value={date}
                         timeZone={getLocalTimezone()}
                         onChange={(_, value) => updateConfig('start_date')(formatTimeISOWithTimezone(value))} />
             <KeyValueListField
                     label="Messages"
                     items={config.messages}
                     createItemLabel="Add message" onCreateItem={addRecurrentMessage}
                     canRemoveItem={() => canRemoveItem} onRemoveItem={(item, index) => removeMessage(index)}
                     renderKey={(item, index) => (<span className="recurrence-column" onClick={() => editRecurrence(index)}>{recurrenceDescription(item.recurrence)}</span>)}
                     renderValue={(item, index) => <Field id={`schedule-message-#{index}`} className="editable-field" value={item.message} onChange={updateMessage(index, 'message')}/>}
             />
             <RecurrenceDialog visible={dialogVisible}
                               onCancel={hideDialog}
                               onConfirm={saveRecurrence}
                               onChange={(recurrence) => this.setState({ recurrence })}
                               recurrence={this.state.recurrence} />
           </div>)
        })()}

      </div>
    )

  }
}

export default ScheduledMessages
