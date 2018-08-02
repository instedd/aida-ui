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

  hourLabel(dayIndex, hourIndex, hour, hours){
    const am = hourIndex < 12
    const beforeNoon = hourIndex <= 12
    const label = `${beforeNoon ? (hourIndex == 0 ? 12 : hourIndex) : hourIndex - 12} ${am ? "AM" : "PM"}`

    return (hour & !hours[dayIndex][hourIndex-1]) || (!hour & hours[dayIndex][hourIndex-1])? label : ""
  }

  render() {
    const {hours, onChange} = this.props

    const onClick = (dayIndex, hourIndex) => {
      onChange(this.toggle(hours, dayIndex, hourIndex))
    }

    return <div id='ContactHoursContainer'>
      <ul className='days-of-the-week'>
        <li>SUN</li>
        <li>MON</li>
        <li>TUE</li>
        <li>WED</li>
        <li>THU</li>
        <li>FRI</li>
        <li>SAT</li>
      </ul>
      <ul className='day-hours'>
        <li>12 AM</li>
        <li>2 AM</li>
        <li>4 AM</li>
        <li>6 AM</li>
        <li>8 AM</li>
        <li>10 AM</li>
        <li>12 PM</li>
        <li>2 PM</li>
        <li>4 PM</li>
        <li>6 PM</li>
        <li>8 PM</li>
        <li>10 PM</li>
      </ul>
      {_.map(hours, (day, dayIndex) =>
        <div key={`${dayIndex}`} className='contactHours'>
          {_.map(day, (hour, hourIndex) =>
              <a key={`${dayIndex}-${hourIndex}`} className={classNames({'hour-block': true, 'on': hour})} onClick={() => onClick(dayIndex, hourIndex)}>{this.hourLabel(dayIndex, hourIndex, hour, hours)}</a>
          )}
        </div>
      )}
    </div>
  }
}

export default WeeklySchedule
