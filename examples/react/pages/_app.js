import App, { Container } from 'next/app'
import React from 'react'

import FelaProvider from '../styling/FelaProvider'

export default class MyApp extends App {
  render() {
    const { Component, pageProps, renderer } = this.props
    return (
      <Container>
        <FelaProvider renderer={renderer}>
          <Component {...pageProps} />
        </FelaProvider>
      </Container>
    )
  }
}
