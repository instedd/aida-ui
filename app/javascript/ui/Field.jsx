import React, { Component } from 'react';
import { TextField } from 'react-md';

export class Field extends Component {
  render() {
    const {label, value, onChange, id, helpText, leftIcon, placeholder, style, className, resize, defaultValue, readOnly, error} = this.props

    const errorMessage = () => {
      if (error && error[0] && error[0].message) {
        const { message } = error[0]

        switch (message) {
          case 'required' :
            return 'Required field'
          case 'white-spaced':
            return 'Contains white spaces'
        }
        return message.charAt(0).toUpperCase() + message.slice(1)
      }
    }

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
      errorText={errorMessage()}
    />
  }
}

export default Field
