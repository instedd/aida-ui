import React, { Component } from 'react'
import { DataTable,
         TableHeader,
         TableBody,
         TableRow,
         TableColumn,
         EditDialogColumn,
         SelectField,
} from 'react-md'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import flatten from 'lodash/flatten'
import map from 'lodash/map'

import MainContent from '../ui/MainContent'
import Title from '../ui/Title'
import { EmptyLoader } from '../ui/Loader'

import * as actions from '../actions/translations'
import { languageNameByCode } from '../utils/lang'

const renderRows = ({ behaviours, firstLang, secondLang, defaultLang, onChange }) => {
  return flatten(map(behaviours, behaviour => {
    const headerRow = (
      <TableRow key={`behaviour-${behaviour.id}`}>
        <TableColumn colSpan="3">
          {behaviour.label}
        </TableColumn>
      </TableRow>
    )

    const keyCell = (behaviourId, key, lang) => {
      if (!lang || lang == defaultLang) {
        return (
          <TableColumn>
            {lang ? key[lang] : ''}
          </TableColumn>
        )
      } else {
        return (
          <EditDialogColumn inline inlineIcon={null}
                            value={key[lang]}
                            onChange={value => onChange({ behaviour_id: behaviourId, key: key._key, lang, value })} />
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
    const { actions, bot } = this.props

    actions.fetchTranslations({botId: bot.id})
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
    const { bot, languages, defaultLang, behaviours, actions } = this.props
    const { firstLang, secondLang } = this.state
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

    return (
      <MainContent wide>
        <Title>Translations</Title>
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
                <SelectField id="first-lang-selector"
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
      </MainContent>
    )
  }
}

const mapStateToProps = (state, {bot}) => {
  const { scope, fetching, behaviours, languages, defaultLang } = state.translations
  if (scope && bot.id == scope.botId) {
    return {
      fetching,
      behaviours,
      languages,
      defaultLang
    }
  } else {
    return {
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
