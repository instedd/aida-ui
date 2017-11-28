import React, { Component } from 'react';
import { TextField } from 'react-md';

export class Field extends Component {
  render() {
    const {label, value, onChange, id, helpText} = this.props

    return <TextField
      label={label}
      id={id || label}
      lineDirection="center"
      value={value}
      onChange={onChange}
      helpText={helpText}
    />
  }
}

export default Field
