import React, { Component } from 'react'
import { FontIcon } from 'react-md'

import Field from '../ui/Field'

import { blank } from '../utils/string'

export const RelevanceField = ({value, onChange}) =>
  <Field id="relevant" className={`relevance-field ${blank(value) ? "blank" : ""}`}
    leftIcon={<FontIcon>traffic</FontIcon>}
    placeholder="Relevance: Add conditions for skill use"
    value={value || ""} onChange={onChange} />
  // since value might be null (config might not have relevant field),
  // force an empty string to avoid controlled vs uncontrolled component

export default RelevanceField
