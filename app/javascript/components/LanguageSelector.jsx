import React, { Component } from 'react'
import { DropdownMenu, ListItem, TextField } from 'react-md'

import map from 'lodash/map'
import filter from 'lodash/filter'
import sortBy from 'lodash/sortBy'
import find from 'lodash/find'
import iso6393 from 'iso-639-3'

import { LANGUAGES, findLanguageByCode } from '../utils/lang'

export default class LanguageSelector extends Component {
  constructor(props) {
    super(props)
    const lang = findLanguageByCode(props.code)
    this.state = { query: lang ? lang.name : "", lang }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.code != this.props.code) {
      const nextLang = findLanguageByCode(nextProps.code)
      this.setState({ query: nextLang ? nextLang.name : this.state.query, lang: nextLang })
    }
  }

  render() {
    const { onChange } = this.props
    const { query } = this.state
    const lowerQuery = (query || '').toLocaleLowerCase()
    const filtered = filter(LANGUAGES, lang => {
      return lang.code.includes(lowerQuery) || lang.query.includes(lowerQuery)
    })
    const items = map(filtered, lang => {
      return {
        key: lang.code,
        primaryText: lang.name,
        secondaryText: lang.code.toUpperCase(),
        onClick: () => {
          this.setState({ query: lang.name, lang: lang })
          if (onChange) {
            onChange(lang.code)
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
                   placeholder="Language"
                   value={this.state.query}
                   onChange={query => this.setState({ query })} />
      </DropdownMenu>
    )
  }
}
