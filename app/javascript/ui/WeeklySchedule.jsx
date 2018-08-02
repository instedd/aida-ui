import React, { Component } from 'react';
import { TextField } from 'react-md';
import classNames from 'classnames/bind'

export class WeeklySchedule extends Component {
  toggle(hourMatrix, dayIndex, hourIndex) {
    const previousDays = hourMatrix.slice(0, dayIndex)
    const day = hourMatrix[dayIndex]
    const nextDays = hourMatrix.slice(dayIndex + 1)

    const previousHours = day.slice(0, hourIndex)
    const hour = day[hourIndex]
    const nextHours = day.slice(hourIndex + 1)

    return ([
      ...previousDays,
      [
        ...previousHours,
        !hour,
        ...nextHours,
      ],
      ...nextDays
    ])
  }

  render() {
    const {hours, onChange} = this.props

    const onClick = (dayIndex, hourIndex) => {
      onChange(this.toggle(hours, dayIndex, hourIndex))
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
