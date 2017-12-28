import React, { Component } from 'react'

export const MainWhite = ({children, sidebar, wide}) =>
  <div className={sidebar ? 'main-with-sidebar' : (wide ? 'main-fullwidth wide' : 'main-fullwidth')}>
    {sidebar}
    <div className='main-content'>
      {children}
    </div>
  </div>

export default MainWhite
