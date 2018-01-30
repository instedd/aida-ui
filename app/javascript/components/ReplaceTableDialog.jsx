import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button, DialogContainer, FileUpload, FontIcon } from 'react-md'

import * as actions from '../actions/tables'

class ReplaceTableDialog extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    actions: PropTypes.any.isRequired,
    uploading: PropTypes.bool,
    uploadError: PropTypes.string,
    uploadedData: PropTypes.any
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.uploadedData && !this.props.uploadedData) {
      setTimeout(() => {
        nextProps.onConfirm(nextProps.uploadedData)
      }, 0)
    }
  }
  render() {
    const {
      uploading, uploadError, uploadedData,
      visible, onCancel, onConfirm, actions
    } = this.props

    let formLabel, formIcon, formExtraClass

    if (uploading) {
      formLabel = "Uploading and parsing file"
      formIcon = (<FontIcon>hourglass_empty</FontIcon>)
    } else if (uploadedData) {
      const rowCount = uploadedData.length - 1
      const columns = uploadedData[0].join(', ')
      formLabel = rowCount == 1 ? '1 row' : `${rowCount} rows`
      formLabel += `; columns: ${columns}`
      formIcon = (<FontIcon>check</FontIcon>)
    } else if (uploadError) {
      formLabel = `Error in uploaded file: ${uploadError}`
      formIcon = (<FontIcon>close</FontIcon>)
      formExtraClass = 'upload-error'
    } else {
      formLabel = "Select file"
      formIcon = (<FontIcon>file_upload</FontIcon>)
    }

    const isValid = !uploading && uploadedData

    const uploadFile = (file) => {
      actions.uploadTableFile(file)
    }

    const buttons = [
      { primary: true, children: 'Cancel', onClick: onCancel }
    ]

    return (
      <DialogContainer visible={visible}
                       id="replace-table-dialog"
                       title="Replace table data"
                       width={500}
                       actions={buttons}
                       onHide={onCancel}>
        <p>
          Select a new file to parse and replace the data table contents
        </p>
        <div className="file-upload-field">
          <label htmlFor="table-file-upload">Upload a file</label>
          <FileUpload id="table-file-upload"
                      label={formLabel}
                      icon={formIcon}
                      disabled={uploading}
                      maxSize={1 * 1024 * 1024}
                      allowDuplicates flat iconBefore
                      className={`file-upload-control ${formExtraClass}`}
                      onLoad={uploadFile}
                      onSizeError={() => alert('File is too big. Maximum 1Mb allowed.')} />
          <p>Excel and CSV files are supported.</p>
        </div>
      </DialogContainer>
    )
  }
}

const mapStateToProps = (state) => {
  const { uploading, uploadError, uploadedData } = state.tables
  return {
    uploading,
    uploadError,
    uploadedData
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(ReplaceTableDialog)
