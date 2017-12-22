import React, { Component } from 'react'

export const SingleColumn = ({children}) =>
  <div className='main-single-column'>
    <div className='main-content'>
      {children}
    </div> 
  </div>

export default SingleColumn
