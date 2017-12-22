import React, { Component } from 'react'

export const MainWhite = ({children, sidebar}) =>
  <div className={sidebar ? 'main-with-sidebar' : 'main-fullwidth'}>
    {sidebar}
    <div className='main-content'>
      {children}
    </div>
  </div>

export default MainWhite
