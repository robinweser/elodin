import Link from 'next/link'
import { useFela } from 'react-fela'

import {
  HeaderImage,
  HeaderText,
  HeaderLink,
  Container,
  Content,
  Nav,
  Layout,
} from './index.elo.js'

export default () => {
  const { css } = useFela()

  return (
    <>
      <div className={css(Nav)}>
        <div className={css(Layout)}>
          <Link href="/">
            <a className={css(HeaderLink)}>Home</a>
          </Link>
        </div>
      </div>
      <div className={css(Content)}>
        <div className={css(HeaderImage)}>
          <div className={css(Layout)}>
            <h1 className={css(HeaderText)}>Weser's Farm</h1>
          </div>
        </div>
        <div>
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
          foo
          <br />
        </div>
      </div>
    </>
  )
}
