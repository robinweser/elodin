import React from 'react'
import { useFela } from 'react-fela'

import { BlockStyle, BlockTextStyle } from './style.elo.js'

export default function Block({ children, onClick, ...styleProps }) {
  const { css } = useFela(styleProps)

  return (
    <div onClick={onClick} className={css(BlockStyle, BlockTextStyle)}>
      {children}
    </div>
  )
}
