import React from 'react'
import { ThemeProvider } from 'react-fela'

import FelaProvider from '../styling/FelaProvider'
import theme from '../styling/theme'

export default function App({ Component, pageProps, renderer }) {
  return (
    <FelaProvider renderer={renderer}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </FelaProvider>
  )
}
