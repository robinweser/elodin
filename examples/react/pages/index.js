import { useState } from 'react'

import Button from '../components/Button'
import LabeledInput from '../components/LabeledInput'
import Block from '../components/Block'

function ModeSwitch() {
  const [mode, setMode] = useState('Light')

  return (
    <div>
      <Block
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
    <Button>Hello</Button>
    <LabeledInput>Text</LabeledInput>
    <ModeSwitch />
  </div>
)
