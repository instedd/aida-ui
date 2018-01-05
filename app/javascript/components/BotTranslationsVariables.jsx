import React, { Component } from 'react'
import {
  Button,
  DataTable,
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

import MainWhite from '../ui/MainWhite'
import Title from '../ui/Title'
import { EmptyLoader } from '../ui/Loader'

import * as actions from '../actions/translations'
import { languageNameByCode } from '../utils/lang'

const renderRows = ({ variables, firstLang, secondLang, defaultLang, onChange, onChangeName }) => (
  map(variables, (variable) => (
    <TableRow key={`variable-${variable.id}`}>
      <EditDialogColumn
        inline inlineIcon={null}
        value={variable.name}
        onChange={(value) => onChangeName({id: variable.id, name: value})} />

      {/* <EditDialogColumn inline inlineIcon={null}
        value={key[lang]}
        onChange={value => onChange({ variable_id: variableId, key: key._key, lang, value })} />

      <EditDialogColumn inline inlineIcon={null}
        value={key[lang]}
        onChange={value => onChange({ variable_id: variableId, key: key._key, lang, value })} /> */}

    </TableRow>
  ))
)

class BotTranslationsVariables extends Component {
  state = {
    firstLang: null,
    secondLang: null
  }

  componentDidMount() {
    const { actions, bot } = this.props

    actions.fetchTranslations({ botId: bot.id })
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
    const { bot, languages, defaultLang, variables, actions } = this.props
    const { firstLang, secondLang } = this.state
    if (!variables) {
      return <EmptyLoader>Loading translations variables</EmptyLoader>
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
    const onChangeName = (variable) => {
      actions.updateVariableName(bot.id, variable)
    }
    const rows = renderRows({ variables, firstLang, secondLang, defaultLang, onChange: onTranslationChange, onChangeName: onChangeName })

    return (
      <MainWhite>
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
                  onChange={value => this.setState({ firstLang: value })} />
              </TableColumn>
              <TableColumn>
                <SelectField id="first-lang-selector"
                  placeholder="Select language"
                  menuItems={langItems}
                  position={SelectField.Positions.BELOW}
                  value={secondLang || ''}
                  onChange={value => this.setState({ secondLang: value })} />
              </TableColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows}
          </TableBody>
        </DataTable>
        
        <Button
          flat
          iconChildren="add"
          onClick={() => actions.addVariable()}>
          Add variable
        </Button>
      </MainWhite>
    )
  }
}

const mapStateToProps = (state, { bot }) => {
  const { scope, fetching, variables, languages, defaultLang } = state.translations
  if (scope && bot.id == scope.botId) {
    return {
      fetching,
      variables,
      languages,
      defaultLang
    }
  } else {
    return {
      fetching: false,
      variables: [],
      languages: [],
      defaultLang: null
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(BotTranslationsVariables)
