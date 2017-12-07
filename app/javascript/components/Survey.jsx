import React, { Component } from 'react'
import { DatePicker, TimePicker, FontIcon, FileUpload } from 'react-md'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as xlsFormsActions from '../actions/xlsForms'

import Title from '../ui/Title'
import Headline from '../ui/Headline'

class Survey extends Component {
  render() {
    const { uploadingStatus, skill, actions, xlsFormsActions } = this.props
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
    const uploading = uploadingStatus === true
    let formLabel, formIcon, formExtraClass

    if (uploading) {
      formLabel = "Uploading form"
      formIcon = (<FontIcon>hourglass_empty</FontIcon>)
    } else if (surveyLoaded) {
      formLabel = `${config.questions.length} questions`
      formIcon = (<FontIcon>check</FontIcon>)
    } else if (uploadingStatus && uploadingStatus.error) {
      formLabel = `Error in uploaded form: ${uploadingStatus.error.error}`
      formIcon = (<FontIcon>close</FontIcon>)
      formExtraClass = 'upload-error'
    } else {
      formLabel = "Upload form"
      formIcon = (<FontIcon>file_upload</FontIcon>)
    }

    return (
      <div>
        <Title>Survey</Title>
        <Headline>
          Ask and discover users needs and interests.
        </Headline>

        <div className="date-time-picker">
          <DatePicker id="survey-date"
                      label="Schedule this survey for"
                      inline
                      fullwidth={false}
                      value={date}
                      onChange={(_, value) => updateConfig('schedule')(value)} />
          <TimePicker id="survey-time"
                      label="at"
                      inline
                      value={date}
                      onChange={(_, value) => updateConfig('schedule')(value)} />
        </div>

        <div className="file-upload-field">
          <label htmlFor="survey-xlsform-upload">Survey form</label>
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
            <a href="http://xlsform.org/#xlsform-tools">these tools</a>
          </p>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, {skill}) => ({
  uploadingStatus: state.xlsForms.uploading[skill.id]
})

const mapDispatchToProps = (dispatch) => ({
  xlsFormsActions: bindActionCreators(xlsFormsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Survey)
