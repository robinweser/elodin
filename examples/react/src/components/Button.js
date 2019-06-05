import { useFela } from 'react-fela'

import { Button as ButtonStyle } from './style.elo.js'

export default function Button({ children, ...styleProps }) {
  const { css } = useFela(styleProps)

  return <div className={css(ButtonStyle)}>{children}</div>
}
