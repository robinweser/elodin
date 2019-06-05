import { Component } from 'react'
import { RendererProvider } from 'react-fela'

import getFelaRenderer from './getFelaRenderer'

const fallbackRenderer = getFelaRenderer()

export default function FelaProvider({ renderer, children }) {
  const currentRenderer = renderer || fallbackRenderer

  return (
    <RendererProvider renderer={currentRenderer}>{children}</RendererProvider>
  )
}
