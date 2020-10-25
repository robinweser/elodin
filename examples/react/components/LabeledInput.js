import React, { useState } from 'react'

import { LabelStyle, InputStyle } from './style.elo.js'

export default function LabeledInput({ children, ...styleProps }) {
  const [value, setValue] = useState('somevalue')

  return (
    <>
      <label className={LabelStyle()}>{children}</label>
      <input
        className={InputStyle()}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </>
  )
}
