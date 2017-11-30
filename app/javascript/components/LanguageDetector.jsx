import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button,
         DataTable,
         EditDialogColumn,
         FontIcon,
         TableBody,
         TableColumn,
         TableRow
} from 'react-md'
import map from 'lodash/map'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import LanguageSelector from './LanguageSelector'

import * as actions from '../actions/skill'

class LanguageDetector extends Component {
  render() {
    const { skill, actions } = this.props
    const { name, config } = skill

    const updateConfig = (key) => {
      return (value) => {
        actions.updateSkill({
          ...skill,
          config: {
            ...skill.config,
            [key]: value
          }
        })
      }
    }

    const addLanguage = () => {
      updateConfig('languages')([...skill.config.languages, {code: '', keywords: ''}])
    }

    const removeLanguage = (index) => {
      const newLangs = skill.config.languages.slice()
      newLangs.splice(index, 1)
      updateConfig('languages')(newLangs)
    }

    const updateLanguage = (index, key) => (value) => {
      const newLangs = skill.config.languages.slice()
      newLangs[index][key] = value
      updateConfig('languages')(newLangs)
    }

    const langRows = map(config.languages, ({code, keywords}, index) => {
      return (
        <TableRow>
          <TableColumn>
            {index > 0 ? <Button icon iconChildren="close" onClick={() => removeLanguage(index)} /> : null}
          </TableColumn>
          <EditDialogColumn inline inlineIcon={null} value={keywords} onChange={updateLanguage(index, 'keywords')}/>
          <TableColumn>
            <FontIcon>chevron_right</FontIcon>
          </TableColumn>
          <TableColumn>
            <LanguageSelector code={code} onChange={updateLanguage(index, 'code')} />
          </TableColumn>
        </TableRow>
      )
    })

    return (
      <div>
        <Title>Language detector</Title>
        <Headline>
          Define the languages you want your bot to support and a strategy to
          detect the user preference
        </Headline>

        <Field id="ld-explanation" label="Language message"
               value={config.explanation} onChange={updateConfig('explanation')} />

        <h4>Available languages</h4>

        <DataTable plain className="languages-list">
          <TableBody>
            {langRows}
            <TableRow className="addlink" onClick={addLanguage}>
              <TableColumn>
                <Button icon iconChildren="add" />
              </TableColumn>
              <TableColumn colSpan={3}>
                Add language
              </TableColumn>
            </TableRow>
          </TableBody>
        </DataTable>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(LanguageDetector)
