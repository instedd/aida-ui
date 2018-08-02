import React, { PropTypes, PureComponent } from 'react'
import { fetchTimezones } from '../actions/timezones'
import { DropdownMenu, ListItem, TextField } from 'react-md'
import timezones from 'tzdata'

class TimezoneDropdown extends PureComponent {
  constructor(props) {
    super(props)
    this.state = stateFor(props.value)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value != this.props.value) {
      this.setState(stateFor(nextProps.value))
    }
  }

  stateFor(timezone) {
    return { query: timezone ? formatTimezone(timezone) : "", timezone }
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
    const { onChange } = this.props
    const { query } = this.state

    const lowerQuery = (query || '').toLowerCase()

    const filtered = filter(timezones, tz => {
      return tz.includes(lowerQuery)
    })

    const items = map(filtered, tz => {
      return {
        key: tz,
        primaryText: formatTimezone(tz),
        secondaryText: tz,
        onClick: () => {
          this.setState({ query: formatTimezone(tz), timezone: tz })
          if (onChange) {
            onChange(tz)
          }
        }
      }
    })

    return (
      <DropdownMenu id="lang-menu"
                    toggleQuery=".md-text-field-container"
                    anchor={{ x: DropdownMenu.HorizontalAnchors.INNER_LEFT,
                              y: DropdownMenu.VerticalAnchors.BOTTOM }}
                    position={DropdownMenu.Positions.BELOW}
                    menuItems={items}>
        <TextField id="lang-query"
                   placeholder="Contact hours"
                   value={this.state.query}
                   onChange={query => this.setState({ query })} />
      </DropdownMenu>
    )
  }
}

export default TimezoneDropdown
