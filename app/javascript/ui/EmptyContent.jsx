import React, { Component } from 'react'
import { FontIcon } from 'react-md'

export const EmptyContent = ({icon, children, imageSrc}) => 
  <div className='main-empty'>    
    <div className='main-content'>
      { imageSrc ? <img src={imageSrc} className='emptyIcon' /> : <FontIcon>{icon}</FontIcon> }
      {children}
    </div>
  </div>

export default EmptyContent
