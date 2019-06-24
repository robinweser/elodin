import Link from 'next/link'
import { useFela } from 'react-fela'

import {
  Header as HeaderStyle,
  NavItem as NavItemStyle,
  Layout as LayoutStyle,
  NavItemLink as NavItemLinkStyle,
} from './style.elo.js'

export default function Header() {
  const { css } = useFela()

  return (
    <header className={css(HeaderStyle)}>
      <nav className={css(LayoutStyle)}>
        <div className={css(NavItemStyle)}>
          <Link href="/documentation">
            <a className={css(NavItemLinkStyle)}>Documentation</a>
          </Link>
        </div>
        <div className={css(NavItemStyle)}>
          <Link href="/targets">
            <a className={css(NavItemLinkStyle)}>Targets</a>
          </Link>
        </div>
        <div className={css(NavItemStyle)}>
          <Link href="/tutorial">
            <a className={css(NavItemLinkStyle)}>Tutorial</a>
          </Link>
        </div>
        <div className={css(NavItemStyle)}>
          <Link href="/blog">
            <a className={css(NavItemLinkStyle)}>Blog</a>
          </Link>
        </div>
      </nav>
    </header>
  )
}
