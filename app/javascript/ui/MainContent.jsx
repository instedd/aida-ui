import React, { Component } from 'react'
// import ScrollableAnchor from 'react-scrollable-anchor'

export const MainContent = ({children, sidebar}) =>
  <div className={sidebar ? 'main-with-sidebar' : 'main-fullwidth'}>
    {sidebar}
    <div className='main-content'>
      {children}
    </div>
  </div>

export default MainContent
