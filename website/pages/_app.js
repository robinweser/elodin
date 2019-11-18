import App from 'next/app'
import React from 'react'

import { StyleProvider } from '@gazzer/globe'

const staticStyle = [
  ['::-webkit-scrollbar', { display: 'none' }],
  [
    'div, form',
    {
      display: 'flex',
      alignSelf: 'stretch',
      flexDirection: 'column',
      flexShrink: 0,
      maxWidth: '100%',
      boxSizing: 'border-box',
      WebkitOverflowScrolling: 'touch',
    },
  ],
  ['address', { fontStyle: 'normal' }],
  [
    'html',
    {
      WebkitTextSizeAdjust: '100%',
      position: 'fixed',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      overflow: 'hidden',
    },
  ],
  ['body, #__next', { height: '100%', maxHeight: '100%', overflow: 'hidden' }],
  [
    'body',
    {
      backgroundColor: 'rgb(0,176,164)',
      overflow: 'hidden',
    },
  ],
  [
    'input, textarea, button, select option, a',
    { fontFamily: 'inherit', outline: 0 },
  ],
]

export default class MyApp extends App {
  render() {
    const { Component, pageProps, renderer } = this.props

    return (
      <StyleProvider renderer={renderer} staticStyles={staticStyle}>
        <Component {...pageProps} />
      </StyleProvider>
    )
  }
}
