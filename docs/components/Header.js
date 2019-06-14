import Link from 'next/link'
import { useFela } from 'react-fela'

import {
  Header as HeaderStyle,
  NavItem as NavItemStyle,
  Layout as LayoutStyle,
} from './style.elo.js'

export default function Header() {
  const { css } = useFela()

  return (
    <header className={css(HeaderStyle)}>
      <nav className={css(LayoutStyle)}>
        <Link href="/documentation">
          <a className={css(NavItemStyle)}>Documentation</a>
        </Link>
        <Link href="/targets">
          <a className={css(NavItemStyle)}>Targets</a>
        </Link>
        <Link href="/tutorial">
          <a className={css(NavItemStyle)}>Tutorial</a>
        </Link>
        <Link href="/blog">
          <a className={css(NavItemStyle)}>Blog</a>
        </Link>
      </nav>
    </header>
  )
}
