import React, { PropTypes, PureComponent } from 'react'
import { DropdownMenu, ListItem, TextField } from 'react-md'
import timezones from 'tzdata'

class TimezoneDropdown extends PureComponent {
  constructor(props) {
    super(props)
    this.state = this.stateFor(props.value)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value != this.props.value) {
      this.setState(this.stateFor(nextProps.value))
    }
  }

  stateFor(timezone) {
    return { query: timezone ? this.formatTimezone(timezone) : "", timezone }
  }

  formatTimezone(tz) {
    const split = (tz || 'UTC').replace('_', ' ').split('/')
    switch (split.length) {
      case 2:
        return `${split[0]} - ${split[1]}`
      case 3:
        return `${split[0]} - ${split[2]}, ${split[1]}`
      default:
        return split[0]
    }
  }

  render() {
    const { onChange, className, readOnly } = this.props
    const { query } = this.state

    const timezoneList = _.without(Object.keys(timezones.zones), ["Factory"])

    const lowerQuery = (query || '').toLowerCase()

    const filtered = _.filter(timezoneList, tz => {
      return this.formatTimezone(tz).toLowerCase().includes(lowerQuery)
    })

    const items = _.map(filtered, tz => {
      return {
        key: tz,
        primaryText: this.formatTimezone(tz),
        onClick: () => {
          this.setState({ query: this.formatTimezone(tz), timezone: tz })
          if (onChange) {
            onChange(tz)
          }
        }
      }
    })

    return (
      <DropdownMenu id="timezone-menu"
                    toggleQuery=".md-text-field-container"
                    anchor={{ x: DropdownMenu.HorizontalAnchors.INNER_LEFT,
                              y: DropdownMenu.VerticalAnchors.BOTTOM }}
                    position={DropdownMenu.Positions.BELOW}
                    className="md-text-field ui-field"
                    menuItems={items}>
        <TextField id="timezone-query"
                   className={`${className || ""}`}
                   label="Contact hours"
                   lineDirection="center"
                   readOnly={readOnly || false}
                   value={this.state.query}
                   onChange={query => this.setState({ query })} />
      </DropdownMenu>
    )
  }
}

export default TimezoneDropdown
