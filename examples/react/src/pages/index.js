import { useState } from 'react'

import Button from '../components/Button'
import LabeledInput from '../components/LabeledInput'
import Block from '../components/Block'

function ModeSwitch() {
  const [mode, setMode] = useState('Light')

  return (
    <div>
      <button onClick={() => setMode(mode === 'Light' ? 'Dark' : 'Light')}>
        Click
      </button>
      <Block Mode={mode}>Hello</Block>
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
