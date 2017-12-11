import React, { Component } from 'react'
import { MainGrey } from '../ui/MainGrey'
import { FontIcon } from 'react-md'

export const EmptyContent = ({icon, children}) => {
  return (
  <MainGrey>
    <div className='empty-content'>
      <FontIcon>{icon}</FontIcon>
      {children}
    </div>
  </MainGrey>
  )}

export default EmptyContent
