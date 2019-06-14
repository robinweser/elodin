import { useFela } from 'react-fela'

import Header from '../components/Header'

import { Layout as LayoutStyle } from '../components/style.elo.js'
import { Test as TestStyle, Spread as SpreadStyle } from './style.elo.js'

export default () => {
  const { css } = useFela()

  return (
    <>
      <Header />
      <div className={css(SpreadStyle, { overflow: 'auto' })}>
        <div>
          Hallo
          <br />
          Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br /> Hallo
          <br />
        </div>
      </div>
      <div className={css(TestStyle)}>Foo</div>
    </>
  )
}
