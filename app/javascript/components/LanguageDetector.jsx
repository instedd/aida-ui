import React, { Component } from 'react'
import { Checkbox } from 'react-md'
import map from 'lodash/map'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import KeyValueListField from '../ui/KeyValueListField'
import LanguageSelector from './LanguageSelector'
import { connect } from 'react-redux'

class LanguageDetector extends Component {
  render() {
    const { skill, actions, witAiErrors, errors } = this.props
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

    const renderError = () => {
      if (witAiErrors.some(e => e.message == 'multilingual-bot')) {
        return <label className="error-message">Wit.ai only works with english bots</label>
      }
    }

    const replyToUnsupportedLang = !!config['reply_to_unsupported_language']

    return (
      <div>
        <Title>Language detector</Title>
        <Headline>
          Define the languages you want your bot to support and a strategy to
          detect the user preference
        </Headline>

        <Field id="ld-explanation"
               label="Language message"
               value={config.explanation}
               onChange={updateConfig('explanation')} />

        <KeyValueListField
          label="Available languages"
          items={config.languages}
          createItemLabel="Add language" onCreateItem={addLanguage}
          canRemoveItem={(item, index) => index > 0} onRemoveItem={(item, index) => removeLanguage(index)}
          renderKey={({code, keywords}, index) => <Field className="editable-field lang-text-input" id="ld-key" value={keywords} onChange={updateLanguage(index, 'keywords')} resize={{min: 100, max: 200}} error={errors.filter(e => e.path[1] && e.path[1].startsWith(`languages/${code}`))} />}
          renderValue={({code, keywords}, index) => <LanguageSelector code={code} onChange={updateLanguage(index, 'code')} error={errors.filter(e => e.path[0].startsWith(`languages/${index}`))} />}
        />

        {renderError()}

        <Checkbox id="reply-to-unsupported-language"
                  name="reply-to-unsupported-language"
                  label="Automatic response for unsupported languages"
                  checked={replyToUnsupportedLang}
                  onChange={updateConfig('reply_to_unsupported_language')} />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    witAiErrors: (state.bots && state.bots.errors) ? state.bots.errors.filter(e => e.path == 'wit_ai') : []
  }
}

export default connect(
  mapStateToProps
)(LanguageDetector)
