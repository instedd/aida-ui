import React from 'react';
import { CircularProgress } from 'react-md';

import { EmptyContent } from './EmptyContent'

export const EmptyLoader = ({children}) => {
  return(
    <EmptyContent>
      <Loader>{children}</Loader>
    </EmptyContent>
  )}

export const Loader = ({children}) =>
  <div className='loader'>
    <CircularProgress id="loader" scale={2} />
    <p>{children}</p>
  </div> 

export default Loader
