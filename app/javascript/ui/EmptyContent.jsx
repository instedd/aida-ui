import React, { Component } from 'react'
import { FontIcon } from 'react-md'

export const EmptyContent = ({icon, children}) => {
  return (
  <div className='main-empty'>    
    <div className='main-content'>
      <FontIcon>{icon}</FontIcon>
      {children}
    </div>
  </div>
  )}

export default EmptyContent
