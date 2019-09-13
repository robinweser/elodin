import { useContext } from 'react'
import { combineRules } from 'fela'

import { RendererContext, ThemeContext } from 'react-fela'

function useFela(props) {
  const renderer = useContext(RendererContext)
  const theme = useContext(ThemeContext) || {}

  if (!renderer) {
    throw new Error(
      'The "useFela" hook can only be used  inside a "RendererProvider"'
    )
  }

  const propsWithTheme = { theme }
  if (props) Object.assign(propsWithTheme, props)

  function css(...rules) {
    return renderer.renderRule(combineRules(...rules), propsWithTheme)
  }

  return {
    renderer,
    theme,
    css,
  }
}
import {
  Block as BlockStyle,
  BlockText as BlockTextStyle,
} from './style.elo.js'

export default function Block({ children, onClick, ...styleProps }) {
  const { css } = useFela(styleProps)

  return (
    <div
      onClick={onClick}
      className={css(BlockStyle) + ' ' + css(BlockTextStyle)}>
      {children}
    </div>
  )
}
