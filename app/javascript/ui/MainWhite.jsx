import React, { Component } from 'react';
import { Paper } from 'react-md';
import Aux from '../hoc/Aux';



export const MainWhite = ({children, sidebar, buttons}) => {

  if (sidebar) {
    return (
      <Aux>
        {buttons}
        <div className='main-with-sidebar'>
          {sidebar}
          <Paper className='main-content'>
            {children}
          </Paper>
        </div>
      </Aux>)
  } else if (buttons) {
    return (
      <Aux>
        {buttons}
        <div className='main-fullwidth'>
          <Paper className='main-content'>
            {children}
          </Paper>
        </div>
      </Aux>
    )
  } else {
    return (
      <div className='main-fullwidth'>
        <Paper className='main-content'>
          {children}
        </Paper>
      </div>
    )
  }
}

export default MainWhite
