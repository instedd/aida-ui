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
import { EmptyLoader } from '../ui/Loader'
import { hasPermission } from '../utils'
import ContentDenied from './ContentDenied'
import Field from '../ui/Field'

import * as actions from '../actions/translations'
import { languageNameByCode } from '../utils/lang'
import BotTranslationsMenu from './BotTranslationsMenu'

const renderRows = ({ variables, firstLang, secondLang, defaultLang, onChange, onRemove, onAddCondition }) => {
  return flatten(map(variables, (variable) => {
    const variableRow = (
      <TableRow key={`variable-${variable.id}`} className="row-variable">
        <TableColumn className="variable-buttons">
          <Button
            icon
            className="btn-remove-variable"
            tooltipLabel="Remove variable"
            tooltipPosition="top"
            onClick={() => onRemove(variable.id)}>
            close
          </Button>
          <Button
            icon
            tooltipLabel="Add condition"
            tooltipPosition="top"
            onClick={() => onAddCondition(variable.id)}>
            add
          </Button>
        </TableColumn>
        <TableColumn>
          <Field id="variable-name" className="editable-field"
            value={variable.name}
            placeholder="variable name"
            onChange={(value) => onChange({
              id: variable.id,
              name: value,
              lang: firstLang,
              value: variable.default_value[firstLang] || ""
            })} />
        </TableColumn>
        <TableColumn>
          <Field id="variable-value" className="editable-field"
            value={variable.default_value[firstLang] || ""}
            placeholder="value"
            onChange={(value) => onChange({
              id: variable.id,
              name: variable.name,
              lang: firstLang,
              value: value
            })} />
        </TableColumn>
        <TableColumn>
          <Field id="variable-value" className="editable-field"
            value={variable.default_value[secondLang] || ""}
            placeholder="value"
            onChange={(value) => onChange({
              id: variable.id,
              name: variable.name,
              lang: secondLang,
              value: value
            })} />
        </TableColumn>
      </TableRow>
    )

    const conditionalRows = map(variable.conditional_values, cv => {
      return (
        <TableRow key={`condition-${cv.id}`} className="row-condition">
          <TableColumn className="variable-buttons">
            <Button
              icon
              className="btn-remove-condition"
              tooltipLabel="Remove condition"
              tooltipPosition="top"
              onClick={() => onRemove(variable.id, cv.id)}>
              close
            </Button>
          </TableColumn>
          <TableColumn>
            <Field id="condition-name" className="editable-field condition-name-column"
              value={cv.condition}
              placeholder="condition"
              onChange={(value) => onChange({
                id: variable.id,
                name: variable.name,
                conditionId: cv.id,
                condition: value,
                conditionOrder: cv.order,
                lang: firstLang,
                value: cv.value[firstLang] || "",
              })}
            />
          </TableColumn>
          <TableColumn>
            <Field id="condition-value" className="editable-field"
              value={cv.value[firstLang] || ""}
              placeholder="value"
              onChange={(value) => onChange({
                id: variable.id,
                name: variable.name,
                conditionId: cv.id,
                condition: cv.condition,
                conditionOrder: cv.order,
                lang: firstLang,
                value
              })}
            />
          </TableColumn>
          <TableColumn>
            <Field id="condition-value" className="editable-field"
              value={cv.value[secondLang] || ""}
              placeholder="value"
              onChange={(value) => onChange({
                id: variable.id,
                name: variable.name,
                conditionId: cv.id,
                condition: cv.condition,
                conditionOrder: cv.order,
                lang: secondLang,
                value
              })}
            />
          </TableColumn>
        </TableRow>
      )
    })

    return [variableRow, ...conditionalRows]
  }))
}

class BotTranslationsVariables extends Component {
  state = {
    firstLang: null,
    secondLang: null
  }

  componentDidMount() {
    const { permitted, actions, bot } = this.props

    if (permitted) {
      actions.fetchTranslations({ botId: bot.id })
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
    const { permitted, bot, languages, defaultLang, variables, actions, onToggleChatWindow } = this.props
    const { firstLang, secondLang } = this.state

    if (!permitted) {
      return <ContentDenied />
    }

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

    const rows = renderRows({ variables, firstLang, secondLang, defaultLang,
      onChange: (updatedAttrs) => (actions.updateVariable(bot.id, updatedAttrs)),
      onRemove: (variableId, conditionId) => (actions.removeVariable(bot.id, variableId, conditionId)),
      onAddCondition: (variableId) => (actions.addVariableCondition(bot.id, variableId)) })

    const buttons = (<Button icon onClick={() => onToggleChatWindow()}>chat</Button>)

    return (
      <MainWhite buttons={buttons}>
        <div className="translations-header">
          <div className="translations-title">
            <Title>Translations</Title>
          </div>
          <BotTranslationsMenu bot={bot} />
        </div>
        <DataTable plain id="variables-table" responsive={false} >
          <TableHeader>
            <TableRow>
              <TableColumn colSpan={2} className="row-variable-condition-header" />
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
          className="btn-add-variable"
          onClick={() => actions.addVariable(defaultLang)}>
          Add variable
        </Button>
      </MainWhite>
    )
  }
}

const mapStateToProps = (state, { bot }) => {
  const { scope, fetching, variables, languages, defaultLang } = state.translations
  const permitted = hasPermission(bot, 'manages_variables')
  if (scope && bot.id == scope.botId) {
    return {
      permitted,
      fetching,
      variables,
      languages,
      defaultLang
    }
  } else {
    return {
      permitted,
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
