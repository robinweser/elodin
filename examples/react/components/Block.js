import React from 'react'

import { BlockStyle } from './style.elo.js'

export default function Block({ children, onClick, Mode }) {
  return (
    <div onClick={onClick} className={BlockStyle({ Mode })}>
      {children}
    </div>
  )
}
