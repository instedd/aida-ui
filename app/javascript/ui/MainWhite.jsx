import React, { Component } from 'react'

export const MainWhite = ({children, sidebar, buttons}) => {
  if (sidebar) {
    return(
      <div className='main-with-sidebar'>
        {sidebar}
        <div className='main-content'>
          {children}
        </div>
        <div className='button-area'>
          {buttons}
        </div> 
      </div>)
  } else {
    return(
      <div className='main-fullwidth'>
        <div className='main-content'>
          {children}
        </div>
      </div>)
  } 
}

export default MainWhite
