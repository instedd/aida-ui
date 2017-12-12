import React, { Component } from 'react'

export const Metric = ({value, label}) =>
  <div className="ui-metric">
    <h1>{value}</h1>
    <span>{label}</span>
  </div>

export default Metric
