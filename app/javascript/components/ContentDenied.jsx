import React, { Component } from 'react'
import { Divider } from 'react-md'

import { EmptyContent } from '../ui/EmptyContent'
import { Headline } from '../ui/Headline'

export default () => {
  return (
    <EmptyContent icon='not_interested'>
      <Headline>Insufficient access</Headline>
      <Divider />
      <p>You don't have enough permissions to access this functionality.</p>
    </EmptyContent>
  )
}
