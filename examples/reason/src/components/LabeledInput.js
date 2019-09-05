import { useFela } from 'react-fela'

import { Label, Input } from './style.elo.js'

export default function LabeledInput({ children, ...styleProps }) {
  const { css } = useFela(styleProps)

  return (
    <>
      <label className={css(Label)}>{children}</label>
      <input className={css(Input)} value="somevalue" />
    </>
  )
}
