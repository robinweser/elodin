import { Fragment } from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import { renderToSheetList } from 'fela-dom'
import { getReset } from '@elodin/generator-css-in-js'

import FelaProvider from '../styling/FelaProvider'
import getFelaRenderer from '../styling/getFelaRenderer'

export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    const serverRenderer = getFelaRenderer()

    const page = renderPage(App => props => (
      <FelaProvider renderer={serverRenderer}>
        <App {...props} />
      </FelaProvider>
    ))

    const sheetList = renderToSheetList(serverRenderer)

    return {
      ...page,
      sheetList,
    }
  }

  render() {
    const { sheetList } = this.props

    const styleNodes = sheetList.map(
      ({ type, rehydration, support, media, css }) => (
        <style
          dangerouslySetInnerHTML={{ __html: css }}
          data-fela-rehydration={rehydration}
          data-fela-support={support}
          data-fela-type={type}
          key={`${type}-${media}`}
          media={media}
        />
      )
    )

    return (
      <html>
        <Head>
          <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
          <meta
            name="viewport"
            content="width=device-width,height=device-height,initial-scale=1, viewport-fit=cover"
          />
          <style dangerouslySetInnerHTML={{ __html: getReset('#__next') }} />
          {styleNodes}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
