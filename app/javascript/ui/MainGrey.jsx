import React, { Component } from 'react'

export const MainGrey = (props) => {

  let mainClasses = 'main-content'

  if (props.scrollX) {
    mainClasses = 'main-content hScroll'
  }
  
  return (
    <div className='main-grey'>
      <div className={mainClasses}>
        {props.children}
      </div> 
    </div>
  )
}

export default MainGrey
