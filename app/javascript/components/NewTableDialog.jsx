import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button, DialogContainer, FileUpload, FontIcon, TextField } from 'react-md'
import values from 'lodash/values'
import map from 'lodash/map'
import includes from 'lodash/includes'

import * as actions from '../actions/tables'
import { blank } from '../utils/string'

class NewTableDialog extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    actions: PropTypes.any.isRequired,
    uploading: PropTypes.bool,
    uploadError: PropTypes.string,
    uploadedData: PropTypes.any,
    takenNames: PropTypes.array
  }

  state = {
    name: ''
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.setState({name: ''})
    }
  }

  render() {
    const {
      uploading, uploadError, uploadedData, takenNames,
      visible, onCancel, onConfirm, actions
    } = this.props
    const { name } = this.state

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

    const trimmedName = name.trim()
    let nameValid, nameError

    if (blank(trimmedName)) {
      nameValid = false
    } else if (includes(takenNames || [], trimmedName)) {
      nameValid = false
      nameError = 'Table already exists'
    } else {
      nameValid = true
    }

    const isValid = !uploading && nameValid && uploadedData

    const uploadFile = (file) => {
      if (blank(trimmedName)) {
        this.setState({name: file.name})
      }
      actions.uploadTableFile(file)
    }

    const addTable = () => {
      this.setState({name: ''})
      actions.resetUpload()
      onConfirm(trimmedName, uploadedData)
    }

    const buttons = [
      { primary: true, children: 'Cancel', onClick: onCancel },
      (<Button flat secondary disabled={!isValid} onClick={addTable}>Add</Button>)
    ]

    return (
      <DialogContainer visible={visible}
                       id="create-table-dialog"
                       title="Add a new table"
                       width={500}
                       actions={buttons}
                       onHide={onCancel}>
        <TextField label="Table name"
                   value={name}
                   onChange={name => this.setState({name})}
                   error={!!nameError}
                   errorText={nameError}
                   id="new-table-name" />
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
  const { items, uploading, uploadError, uploadedData } = state.tables
  const takenNames = map(values(items), 'name')
  return {
    takenNames,
    uploading,
    uploadError,
    uploadedData
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(NewTableDialog)
