import React from 'react'

export const Layout = ({children, header, footer}) =>
  <div className="grid">
    {header}
    <main>
      {children}
    </main>
    {footer}
  </div>

export default Layout
