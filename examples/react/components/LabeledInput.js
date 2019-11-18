import React, { useState } from 'react'
import { useFela } from 'react-fela'

import { LabelStyle, InputStyle } from './style.elo.js'

export default function LabeledInput({ children, ...styleProps }) {
  const [value, setValue] = useState('somevalue')
  const { css } = useFela(styleProps)

  return (
    <>
      <label className={css(LabelStyle)}>{children}</label>
      <input
        className={css(InputStyle)}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    </>
  )
}
