import React, { Component } from 'react';
import { TextField } from 'react-md';

export class Field extends Component {
  render() {
    const {label, value, onChange, id, helpText, leftIcon, placeholder, style, className, resize} = this.props

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
    />
  }
}

export default Field
