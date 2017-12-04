import React, { Component } from 'react'
// import ScrollableAnchor from 'react-scrollable-anchor'

export const MainContent = ({children, sidebar, wide}) =>
  <div className={sidebar ? 'main-with-sidebar' : (wide ? 'main-fullwidth wide' : 'main-fullwidth')}>
    {sidebar}
    <div className='main-content'>
      {children}
    </div>
  </div>

export default MainContent
