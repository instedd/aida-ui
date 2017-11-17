import React, { Component } from 'react';
import UserMenu from './UserMenu'
import HeaderSubNav from './HeaderSubNav'
import * as Md from 'react-md';

const nav = <nav>
              <div className='sections'>
                <Md.Button href='http://google.com' flat label="Bots" />
              </div>
              <UserMenu />
            </nav>

export const Header = ({icon, title}) => {
  return (
    <Md.Toolbar
      className='mainToolbar'
      colored
      nav={nav}
      title={
        <div className='sub-nav'>
          {icon}
          <h1>{title}</h1>
        </div>
      }
      children={<HeaderSubNav />}
      prominent
    />
  )
}

export default Header
