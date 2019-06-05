import { createRenderer } from 'fela'
import { render } from 'fela-dom'

import { Header } from './style.elodin.js'

const renderer = createRenderer()

document.getElementById('foo').className = renderer.renderRule(Header, {
  fontSize: '30px',
  bgColor: 'blue',
})

document.getElementById('bar').className = renderer.renderRule(Header, {
  fontSize: '40px',
  bgColor: 'green',
})

render(renderer)
