import { useState } from 'react'

import Button from '../components/Button'
import LabeledInput from '../components/LabeledInput'
import Block from '../components/Block'

function ModeSwitch() {
  const [mode, setMode] = useState('Light')
  const [size, setSize] = useState(16)

  return (
    <div>
      <input
        type="number"
        value={size}
        onChange={e => setSize(e.target.value)}
      />
      <Block
        size={size}
        Mode={mode}
        onClick={() => setMode(mode === 'Light' ? 'Dark' : 'Light')}>
        Mode: {mode}
      </Block>
    </div>
  )
}

export default () => (
  <div>
    <Button>Hello</Button>
    <Button fontSize={30}>Hello</Button>
    <LabeledInput>Text</LabeledInput>
    <ModeSwitch />
  </div>
)
