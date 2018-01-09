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
import BotTranslationsMenu from './BotTranslationsMenu'

const renderRows = ({ variables, firstLang, secondLang, defaultLang, onChange, onRemove, onAddCondition }) => {
  return flatten(map(variables, (variable) => {
    const variableRow = (
      <TableRow key={`variable-${variable.id}`} className="row-variable-condition">
        <TableColumn>
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

        <EditDialogColumn
          inline inlineIcon={null}
          value={variable.name}
          onChange={(value) => onChange({
            id: variable.id,
            name: value,
            lang: firstLang,
            value: variable.default_value[firstLang] || ""
          })} />

        <EditDialogColumn
          inline inlineIcon={null}
          value={variable.default_value[firstLang]}
          onChange={(value) => onChange({
            id: variable.id,
            name: variable.name,
            lang: firstLang,
            value: value
          })} />


        <EditDialogColumn
          inline inlineIcon={null}
          value={variable.default_value[secondLang]}
          onChange={(value) => onChange({
            id: variable.id,
            name: variable.name,
            lang: secondLang,
            value: value
          })} />

      </TableRow>
    )

    const conditionalRows = map(variable.conditional_values, cv => {
      return (
        <TableRow key={`condition-${cv.id}`} className="row-variable-condition">
          <TableColumn>
            <Button
              icon
              className="btn-remove-condition"
              tooltipLabel="Remove condition"
              tooltipPosition="top"
              onClick={() => onRemove(variable.id, cv.id)}>
              close
            </Button>
          </TableColumn>
          <EditDialogColumn
            inline inlineIcon={null}
            value={cv.condition}
            className="condition-name-column"
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
          <EditDialogColumn
            inline inlineIcon={null}
            value={cv.value[firstLang]}
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
          <EditDialogColumn
            inline inlineIcon={null}
            value={cv.value[secondLang]}
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

    const rows = renderRows({ variables, firstLang, secondLang, defaultLang,
      onChange: (updatedAttrs) => (actions.updateVariable(bot.id, updatedAttrs)),
      onRemove: (variableId, conditionId) => (actions.removeVariable(bot.id, variableId, conditionId)),
      onAddCondition: (variableId) => (actions.addVariableCondition(bot.id, variableId)) })

    return (
      <MainWhite>
        <div className="translations-header">
          <div className="translations-tittle">
            <Title>Translations</Title>
          </div>
          <BotTranslationsMenu bot={bot} />
        </div>
        <DataTable plain id="translations-table">
          <TableHeader>
            <TableRow>
              <TableColumn />
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
          onClick={() => actions.addVariable(defaultLang)}>
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
