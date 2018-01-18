import React, { Component } from 'react'
import {
  Button,
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableColumn,
  SelectField,
} from 'react-md'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import flatten from 'lodash/flatten'
import map from 'lodash/map'

import MainWhite from '../ui/MainWhite'
import Title from '../ui/Title'
import Field from '../ui/Field'
import { EmptyLoader } from '../ui/Loader'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'

import * as actions from '../actions/translations'
import { languageNameByCode } from '../utils/lang'
import BotTranslationsMenu from './BotTranslationsMenu'

const renderRows = ({ behaviours, firstLang, secondLang, defaultLang, onChange }) => {
  return flatten(map(behaviours, behaviour => {
    const headerRow = (
      <TableRow key={`behaviour-${behaviour.id}`}>
        <TableColumn className="behaviour-label" colSpan="3">
          {behaviour.label}
        </TableColumn>
      </TableRow>
    )

    const keyCell = (behaviourId, key, lang) => {
      if (!lang || lang == defaultLang) {
        return (
          <TableColumn className="default-lang">
            {lang ? key[lang] : ''}
          </TableColumn>
        )
      } else {
        return (<TableColumn>
          <Field  id="translation-value" className="editable-field"
                  value={key[lang]}
                  onChange={value => onChange({ behaviour_id: behaviourId, key: key._key, lang, value })} />
        </TableColumn>
        )
      }
    }

    const keyRows = map(behaviour.keys, key => {
      return (
        <TableRow key={`behaviour-${behaviour.id}-${key._key}`}>
          <TableColumn>
            <span className="translation-key">
              {key._label}
            </span>
          </TableColumn>
          {keyCell(behaviour.id, key, firstLang)}
          {keyCell(behaviour.id, key, secondLang)}
        </TableRow>
      )
    })

    return [headerRow, ...keyRows]
    }))
}

class BotTranslations extends Component {
  state = {
    firstLang: null,
    secondLang: null
  }

  componentDidMount() {
    const { permitted, actions, bot } = this.props

    if (permitted) {
      actions.fetchTranslations({botId: bot.id})
    }
  }

  componentWillReceiveProps(nextProps) {
    let update = {}
    const { firstLang, secondLang } = this.state
    if (!firstLang && !secondLang) {
      if (nextProps.defaultLang) {
        update.firstLang = nextProps.defaultLang
      }
      if (nextProps.languages && nextProps.languages.length > 1) {
        update.secondLang = nextProps.languages[1]
      }
      this.setState(update)
    }
  }

  render() {
    const { permitted, bot, languages, defaultLang, behaviours, actions, onToggleChatWindow } = this.props
    const { firstLang, secondLang } = this.state
    if (!permitted) {
      return <ContentDenied />
    }
    if (!behaviours) {
      return <EmptyLoader>Loading translations</EmptyLoader>
    }

    const langItems = map(languages || [], value => {
      let label = languageNameByCode(value)
      if (value == defaultLang) {
        label += " (default)"
      }
      return { label, value }
    })

    const onTranslationChange = (translation) => {
      actions.updateTranslation(bot.id, translation)
    }
    const rows = renderRows({ behaviours, firstLang, secondLang, defaultLang, onChange: onTranslationChange })

    const buttons = (<Button icon onClick={() => onToggleChatWindow()}>chat</Button>)

    return (
      <MainWhite buttons={buttons}>
        <div className="translations-header">
          <div className="translations-title">
            <Title>Translations</Title>
          </div>
          <BotTranslationsMenu bot={bot} />
        </div>
        <DataTable plain id="translations-table">
          <TableHeader>
            <TableRow>
              <TableColumn />
              <TableColumn>
                <SelectField id="first-lang-selector"
                             placeholder="Select language"
                             menuItems={langItems}
                             position={SelectField.Positions.BELOW}
                             value={firstLang || ''}
                             onChange={value => this.setState({firstLang: value})} />
              </TableColumn>
              <TableColumn>
                <SelectField id="second-lang-selector"
                             placeholder="Select language"
                             menuItems={langItems}
                             position={SelectField.Positions.BELOW}
                             value={secondLang || ''}
                             onChange={value => this.setState({secondLang: value})} />
              </TableColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows}
          </TableBody>
        </DataTable>
      </MainWhite>
    )
  }
}

const mapStateToProps = (state, {bot}) => {
  const { scope, fetching, behaviours, languages, defaultLang } = state.translations
  const permitted = hasPermission(bot, 'manages_content')
  if (scope && bot.id == scope.botId) {
    return {
      permitted,
      fetching,
      behaviours,
      languages,
      defaultLang
    }
  } else {
    return {
      permitted,
      fetching: false,
      behaviours: [],
      languages: [],
      defaultLang: null
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(BotTranslations)
