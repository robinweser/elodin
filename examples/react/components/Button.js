import React from 'react'
import { useFela } from 'react-fela'

import { ButtonStyle, ButtonTextStyle } from './style.elo.js'

export default function Button({ children, ...styleProps }) {
  const { css } = useFela(styleProps)

  return <div className={css(ButtonStyle, ButtonTextStyle)}>{children}</div>
}
