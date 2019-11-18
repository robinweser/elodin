import App from 'next/app'
import Head from 'next/head'
import React from 'react'

import { make as FelaProvider } from '../styling/FelaProvider.bs.js'

export default class MyApp extends App {
  render() {
    const { Component, pageProps, renderer } = this.props

    return (
      <FelaProvider renderer={renderer}>
        <Component {...pageProps} />
      </FelaProvider>
    )
  }
}
