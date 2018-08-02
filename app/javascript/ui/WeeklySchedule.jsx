import React, { Component } from 'react';
import { TextField } from 'react-md';
import classNames from 'classnames/bind'

export class WeeklySchedule extends Component {
  render() {
    const {label, hours, onChange, id, helpText, leftIcon, placeholder, style, className, resize, defaultValue, readOnly, error} = this.props

    const onClick = (dayIndex, hourIndex) => {
      console.log(dayIndex, hourIndex)
      // onChange(hours)
    }

    return <div>
      {_.map(hours, (day, dayIndex) =>
        <div key={`${dayIndex}`} style={{display: "inline"}}>
          {_.map(day, (hour, hourIndex) =>
              <a key={`${dayIndex}-${hourIndex}`} className={classNames({'hour-block': true, 'on': hour})} onClick={() => onClick(dayIndex, hourIndex)}>enabled: {`${hour}`}</a>
          )}
        </div>
      )}
    </div>
  }
}

export default WeeklySchedule
