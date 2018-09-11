import React, { Component } from 'react'
import { DatePicker, TimePicker, FontIcon, FileUpload } from 'react-md'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as xlsFormsActions from '../actions/xlsForms'

import Field from '../ui/Field'
import Title from '../ui/Title'
import Headline from '../ui/Headline'
import { getLocalTimezone } from '../utils'
import KeywordInput from '../ui/KeywordInput'

import RelevanceField from './RelevanceField'

class Survey extends Component {
  render() {
    const { uploadStatus, skill, actions, xlsFormsActions, errors, bot, botActions } = this.props
    const { uploading, error: uploadError } = uploadStatus
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

    const uploadFormFile = (file) => {
      return xlsFormsActions.uploadXlsFormFor(skill, file)
    }

    const date = config.schedule ? new Date(config.schedule) : undefined
    const surveyLoaded = config.questions.length > 0
    let formLabel, formIcon, formExtraClass

    let auxUploadError

    if(errors.some(e => e.path[1] == "questions")) {
      auxUploadError = errors.filter(e => e.path[1] == "questions")[0].message
    }
    else {
      auxUploadError = uploadError
    }

    if (uploading) {
      formLabel = "Uploading form"
      formIcon = (<FontIcon>hourglass_empty</FontIcon>)
    } else if (surveyLoaded) {
      formLabel = config.questions.length == 1 ? '1 question' : `${config.questions.length} questions`
      formIcon = (<FontIcon>check</FontIcon>)
    } else if (auxUploadError) {
      formLabel = `Error in uploaded form: ${auxUploadError}`
      formIcon = (<FontIcon>close</FontIcon>)
      formExtraClass = 'upload-error'
    } else {
      formLabel = <div className='md-icon-separator'>Upload your <span>CSV file</span></div>
      formIcon = (<FontIcon>file_upload</FontIcon>)
    }

    return (
      <div>
        <Title>Survey</Title>
        <Headline>
          Ask and discover users needs and interests.
        </Headline>

        <RelevanceField value={config.relevant} onChange={updateConfig('relevant')} />

        <div className="date-time-picker ui-field survey-picker">
          <label className="md-floating-label md-floating-label--floating md-text--secondary">Schedule this survey for</label>
          <DatePicker id="survey-date"
                      inline
                      fullwidth={false}
                      rightIcon={<FontIcon className='overlapped-icon'>date_range</FontIcon>}
                      icon={null}
                      value={date}
                      timeZone={getLocalTimezone()}
                      onChange={(_, value) => updateConfig('schedule')(value)}
                      error={errors.some(e => e.path[1] == "schedule")} />
          <label className='at-label'>at</label>
          <TimePicker id="survey-time"
                      textFieldClassName='survey-time-picker'
                      inline
                      value={date}
                      icon={null}
                      onChange={(_, value) => updateConfig('schedule')(value)}
                      error={errors.some(e => e.path[1] == "schedule")} />
        </div>

        <KeywordInput
          actions={botActions}
          bot={bot}
          onKeywordChange={updateConfig('keywords')}
          keywords={config.keywords}
          keywordErrors={errors.filter(e => e.path[1].startsWith("keywords/en"))}
          onUseWitAiChange={updateConfig('use_wit_ai')}
          useWitAi={config.use_wit_ai}
          trainingSentences={config.training_sentences}
          trainingSentenceErrors={errors.filter(e => e.path[1].startsWith("training_sentences/en"))}
          onTrainingSentenceChange={updateConfig('training_sentences')}
        />

        <div className="file-upload-field">
          <label htmlFor="survey-xlsform-upload" className='label'>Survey form</label>
          <FileUpload id="survey-xlsform-upload"
                      label={formLabel}
                      icon={formIcon}
                      disabled={uploading}
                      maxSize={1 * 1024 * 1024}
                      allowDuplicates flat iconBefore
                      className={`file-upload-control ${formExtraClass}`}
                      onLoad={uploadFormFile}
                      onSizeError={() => alert('File is too big. Maximum 1Mb allowed.')} />
          <p>
            Aida supports XLSForms, you can design your survey using any of&nbsp;
            <a href="http://xlsform.org/#xlsform-tools" className="hrefLink">these tools</a>
          </p>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, {skill}) => ({
  uploadStatus: state.xlsForms.uploadStatus[skill.id] || { uploading: false }
})

const mapDispatchToProps = (dispatch) => ({
  xlsFormsActions: bindActionCreators(xlsFormsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Survey)
