import React, { Component } from 'react';
import { TextField } from 'react-md';

export class WeeklySchedule extends Component {
  render() {
    const {label, value, onChange, id, helpText, leftIcon, placeholder, style, className, resize, defaultValue, readOnly, error} = this.props

    return <TextField
      label={label}
      className={`ui-field ${className || ""}`}
      id={id || label}
      lineDirection="center"
      value={value}
      onChange={onChange}
      helpText={helpText}
      leftIcon={leftIcon}
      placeholder={placeholder}
      style={style}
      resize={resize}
      defaultValue={defaultValue}
      readOnly={readOnly || false}
      error={error && error.length > 0}
      errorText={error && error[0] && error[0].message}
    />
  }
}

export default WeeklySchedule
