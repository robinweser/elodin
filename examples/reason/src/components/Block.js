import { useFela } from 'react-fela'

import { Block as BlockStyle } from './style.elo.js'

export default function Block({ children, onClick, ...styleProps }) {
  const { css } = useFela(styleProps)

  return (
    <div onClick={onClick} className={css(BlockStyle)}>
      {children}
    </div>
  )
}
